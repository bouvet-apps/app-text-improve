let expectationBtn;
let verifyBtn;
let infoBtn;
let widgetBtn;

const contactService = async(requestData) => {
  document.getElementById("text-improve__result").innerHTML = requestData.locale === "no" ? "ChatGPT prosesserer artikkeldata..." : "ChatGPT is processing the article data...";
  document.getElementById("imgSpin").classList.remove("hidden");
  const response = await fetch(requestData.url, {
    method: "POST",
    body: JSON.stringify(requestData.body)
  }).then((res) => res.text());

  if (response.length > 0) {
    document.getElementById("imgSpin").classList.add("hidden");
    document.getElementById(requestData.body.queryType).removeAttribute("disabled");
    document.getElementById("text-improve__result").innerHTML = response.replace(/\./g, ".<br><br>");
  }
};

const buildRequestData = async(queryType) => {
  const form = document.getElementById(`text-improve__${queryType}Form`);
  const contentId = document.getElementById(`${queryType}ContentId`).value;
  const url = form.dataset.action;
  const body = { contentId, queryType };
  const locale = form.dataset.locale;

  if (queryType === "verify") {
    const contentUrl = document.getElementById("widgetView").getAttribute("data-contenturl");

    body.articleText = await fetch(contentUrl)
      .then((response) => response.text())
      .then((html) => {
        // Initialize the DOM parser
        // eslint-disable-next-line no-undef
        const parser = new DOMParser();
        // Parse the text
        const doc = parser.parseFromString(html, "text/html");

        let content;
        if (doc.querySelector("[role='main']")) {
          content = doc.querySelector("[role='main']");
        } else if (doc.querySelector("main")) {
          content = doc.querySelector("main");
        } else if (doc.querySelector("[data-portal-region='main']")) {
          content = doc.querySelector("[data-portal-region='main']");
        } else {
          content = doc;
        }
        return content.innerText.replace(/\n/g, "");
      })
      .catch((err) => {
        console.log("Failed to fetch page: ", err);
      });
  }

  return {
    url,
    body,
    locale
  };
};

const initialize = () => {
  expectationBtn = document.getElementById("expectation");
  verifyBtn = document.getElementById("verify");
  infoBtn = document.getElementById("infoShow");
  widgetBtn = document.getElementById("widgetShow");

  if (expectationBtn) {
    expectationBtn.addEventListener("click", async(event) => {
      event.preventDefault();
      expectationBtn.setAttribute("disabled", true);
      const requestData = await buildRequestData("expectation");
      contactService(requestData);
    }, false);
  }

  if (verifyBtn) {
    verifyBtn.addEventListener("click", async(event) => {
      event.preventDefault();
      verifyBtn.setAttribute("disabled", true);
      const requestData = await buildRequestData("verify");
      contactService(requestData);
    }, false);
  }

  if (infoBtn) {
    infoBtn.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById("infoView").classList.remove("hidden");
      document.getElementById("widgetView").classList.add("hidden");
    }, false);
  }

  if (widgetBtn) {
    widgetBtn.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById("widgetView").classList.remove("hidden");
      document.getElementById("infoView").classList.add("hidden");
    }, false);
  }
};
initialize();
