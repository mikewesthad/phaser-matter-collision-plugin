export function startTest() {
  const htmlString = `
    <div class="test-status" style="position: absolute;top: 0;left: 0;">
      Test status:
      <div class="test-running">Running...</div>
      <div class="test-pass" style="color: #14f000;display:none">Pass!</div>
      <div class="test-fail" style="color: #c72b00;display:none">Fail!</div>
    </div>  
  `.trim();
  const range = document.createRange();
  range.selectNode(document.body);
  const documentFragment = range.createContextualFragment(htmlString);
  document.body.appendChild(documentFragment);
}

export function passTest() {
  document.querySelector(".test-running").style.display = "none";
  document.querySelector(".test-pass").style.display = "initial";
  document.querySelector(".test-fail").style.display = "none";
}
export function failTest() {
  document.querySelector(".test-running").style.display = "none";
  document.querySelector(".test-pass").style.display = "none";
  document.querySelector(".test-fail").style.display = "initial";
}
