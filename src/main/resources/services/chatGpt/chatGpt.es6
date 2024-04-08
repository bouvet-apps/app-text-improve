const libs = {
  content: require("/lib/xp/content"),
  httpClient: require("/lib/http-client"),
  portal: require("/lib/xp/portal"),
  context: require("/lib/xp/context")
};

const apiKey = app.config?.apiKey;

const sendQuery = (query) => {
  const data = {
    messages: [{
      role: "user",
      content: query
    }],
    model: "gpt-3.5-turbo",
    temperature: 0.7
  };

  let response;
  try {
    response = libs.httpClient.request({
      url: "https://api.openai.com/v1/chat/completions",
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

exports.post = (req) => {
  const params = JSON.parse(req.body);
  const content = libs.content.get({ key: params.contentId });

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
      query = `Jeg skriver en artikkel for et nettsted. Tittelen på artikkelen er "${title}". Ingress for artikkelen er "${preface}". Her er hele artikkelteksten: ${params.articleText}. Har jeg besvart leserens forventninger til hva man kan lese om i denne artikkelen, basert på tittel og ingress?`;
    } else {
      query = `I'm writing an article for a webpage. The article title is "${title}". The preface is "${preface}". Here's the complete article: ${params.articleText}. Have I answered the reader's expectations for what the article is about, based on the title and the preface?`;
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
    body: parsedResponse.choices?.[0]?.message?.content
  };
};
