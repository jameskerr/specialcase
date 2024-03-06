const KNOWN_ABBREVIATIONS = ["CSS", "HTML", "JS", "DOM", "API"];

class ProseContent extends HTMLDivElement {
  constructor() {
    super();
  }

  connectedCallback() {
    for (const p of this.querySelectorAll("p")) {
      let html = p.innerHTML;
      for (const abbr of KNOWN_ABBREVIATIONS) {
        const regexp = new RegExp(`${abbr}`, "g");
        html = html.replace(regexp, `<abbr>${abbr}</abbr>`);
      }
      p.innerHTML = html;
    }
  }
}

customElements.define("prose-content", ProseContent, {
  extends: "div",
});
