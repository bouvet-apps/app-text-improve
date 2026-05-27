const libs = {
  portal: require("/lib/xp/portal"),
  content: require("/lib/xp/content"),
  thymeleaf: require("/lib/thymeleaf"),
  i18n: require("/lib/xp/i18n")
};

let view = resolve("text-improve.html");
const apiKey = app.config?.apiKey;

const createServiceUrl = (service) => libs.portal.serviceUrl({
  service: service,
  type: "absolute"
});

exports.get = (req) => {
  if (!apiKey) {
    view = resolve("key.html");
    return {
      body: libs.thymeleaf.render(view, {}),
      contentType: "text/html"
    };
  }

  let contentId = req.params.contentId;
  if (!contentId && libs.portal.getContent()) {
    contentId = libs.portal.getContent()._id;
  }

  if (!contentId) {
    return {
      contentType: "text/html",
      body: "<widget class=\"error\">No content selected</widget>"
    };
  }

  const content = libs.content.get({ key: contentId });
  const chatGptUrl = createServiceUrl("chatGpt");
  const widgetScriptUrl = libs.portal.assetUrl({ path: "js/widget.js" });
  const locale = content?.language || "no";
  const contentUrl = libs.portal.pageUrl({ id: contentId, type: "absolute" });

  const model = {
    serviceUrl: chatGptUrl,
    contentUrl: contentUrl,
    openAiPoweredBy: libs.portal.assetUrl({ path: "images/powered-by-openai.svg" }),
    openAiLogo: libs.portal.assetUrl({ path: "images/openai-logo.svg" }),
    key: contentId,
    widgetScriptUrl,
    locale,
    localized: {
      info: libs.i18n.localize({ key: "widgets.text-improve.info", locale }),
      expectation: libs.i18n.localize({ key: "widgets.text-improve.expectation", locale }),
      verify: libs.i18n.localize({ key: "widgets.text-improve.verify", locale }),
      expectationInfo: libs.i18n.localize({ key: "widgets.text-improve.expectationInfo", locale }),
      verifyInfo: libs.i18n.localize({ key: "widgets.text-improve.verifyInfo", locale }),
      infoTitle: libs.i18n.localize({ key: "widgets.text-improve.infoTitle", locale }),
      infoSubtitle: libs.i18n.localize({ key: "widgets.text-improve.infoSubtitle", locale }),
      infoDescription1: libs.i18n.localize({ key: "widgets.text-improve.infoDescription1", locale }),
      infoDescription2: libs.i18n.localize({ key: "widgets.text-improve.infoDescription2", locale }),
      infoDescription3: libs.i18n.localize({ key: "widgets.text-improve.infoDescription3", locale }),
      infoListItem1: libs.i18n.localize({ key: "widgets.text-improve.infoListItem1", locale }),
      infoListItem2: libs.i18n.localize({ key: "widgets.text-improve.infoListItem2", locale }),
      infoDescription4: libs.i18n.localize({ key: "widgets.text-improve.infoDescription4", locale }),
      infoDescription5: libs.i18n.localize({ key: "widgets.text-improve.infoDescription5", locale }),
      infoClose: libs.i18n.localize({ key: "widgets.text-improve.infoClose", locale })
    }
  };

  return {
    body: libs.thymeleaf.render(view, model),
    contentType: "text/html"
  };
};
