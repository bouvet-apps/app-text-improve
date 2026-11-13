const libs = {
  content: require("/lib/xp/content"),
  httpClient: require("/lib/http-client"),
  portal: require("/lib/xp/portal"),
  context: require("/lib/xp/context"),
  common: require("/lib/xp/common")
};

const apiKey = app.config?.apiKey;
const alternativeModel = app.config?.model;

const sendQuery = (query) => {
  const data = {
    instructions: "Answer in plain text in the same language as the question. Do not use Markdown or any other formatting syntax. Separate paragraphs with a blank line, and put each list item on its own line starting with \"• \".",
    input: query,
    model: alternativeModel ?? "gpt-6-luna",
    store: false
  };

  let response;
  try {
    response = libs.httpClient.request({
      url: "https://api.openai.com/v1/responses",
      method: "POST",
      headers: {
        "Cache-Control": "no-cache",
        Authorization: `Bearer ${apiKey}`,
        contentType: "application/json"
      },
      connectionTimeout: 40000,
      readTimeout: 40000,
      body: JSON.stringify(data),
      contentType: "application/json"
    });
  } catch (e) {
    log.error(`Failed sending data to chatGpt. Error: ${e}`);
  }

  return response;
};

// The raw REST response has no `output_text` shortcut (that is an SDK helper), and `output` may also hold reasoning items.
const getOutputText = (parsedResponse) => {
  let text = "";
  (parsedResponse.output ?? []).forEach((item) => {
    if (item.type === "message") {
      (item.content ?? []).forEach((part) => {
        if (part.type === "output_text") {
          text += part.text;
        }
      });
    }
  });
  return text;
};

// The widget inserts the answer as HTML, so the model's text must not be able to add markup of its own.
const escapeHtml = (text) => text
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

exports.post = (req) => {
  const params = JSON.parse(req.body);
  const content = libs.content.get({ key: params.contentId });
  const sanitisedContent = params.articleText ? libs.common.sanitize(params.articleText).replaceAll("-", " ") : "";

  let title = "";
  let preface = "";
  if (content.data[app.config?.titleTag] || content.displayName || content.data.title) {
    title = content.data[app.config?.titleTag] ?? content.displayName ?? content.data.title;
  }
  if (content.data[app.config?.prefaceTag] || content.data.preface || content.data.ingress || content.data.lead) {
    preface = content.data[app.config?.prefaceTag] ?? content.data.preface ?? content.data.ingress ?? content.data.lead;
  }

  let query;
  if (params.queryType === "expectation") {
    if (content.language === "no") {
      query = `Jeg skriver en artikkel for et nettsted. Tittelen på artikkelen er "${title}". Ingress for artikkelen er "${preface}". Hva ville du som leser forvente å lese om i denne artikkelen?`;
    } else {
      query = `I'm writing an article for a webpage. The article title is "${title}". The preface is "${preface}". What would you as a reader expect to read about in this article`;
    }
  } else if (params.queryType === "verify") {
    if (content.language === "no") {
      query = `Jeg skriver en artikkel for et nettsted. Tittelen på artikkelen er "${title}". Ingress for artikkelen er "${preface}". Her er hele artikkelteksten: ${sanitisedContent}. Har jeg besvart leserens forventninger til hva man kan lese om i denne artikkelen, basert på tittel og ingress?`;
    } else {
      query = `I'm writing an article for a webpage. The article title is "${title}". The preface is "${preface}". Here's the complete article: ${sanitisedContent}. Have I answered the reader's expectations for what the article is about, based on the title and the preface?`;
    }
  }

  const response = sendQuery(query);
  if (response.status !== 200) {
    log.error(`ChatGpt could not process the request. Response: ${response.status}, ${response.message}, ${response.body}`);
    return {
      contentType: "text/html",
      body: `<p class="error">Something went wrong when trying to send a request to ChatGpt.<br>${response.message ? `Error message: ${response.message}` : ""}</p>`
    };
  }

  const parsedResponse = JSON.parse(response.body);
  return {
    contentType: "text/html",
    body: escapeHtml(getOutputText(parsedResponse).trim())
  };
};
