function pad(num, size) {
  let s = "00000" + num;
  return s.substr(s.length - size);
}
function readCounter() {
  const v = localStorage.getItem("avis_serial_counter");
  return v ? parseInt(v, 10) : 0;
}
function writeCounter(n) {
  localStorage.setItem("avis_serial_counter", String(n));
}
function peekNext() {
  const cur = readCounter();
  return cur === 0 ? 1 : cur + 1;
}
function consumeNext() {
  const cur = readCounter();
  const next = cur === 0 ? 1 : cur + 1;
  writeCounter(next);
  return next;
}
function setHeaderNow() {
  const now = new Date();
  document.getElementById("faturaTarih").textContent = now.toLocaleString("tr-TR");
  const nxt = peekNext();
  document.getElementById("faturaSeri").textContent = "AVS2025 / " + pad(nxt, 5);
}
setHeaderNow();

async function generatePdfFromNode(node, filename) {
  const { jsPDF } = window.jspdf;
  const scale = 2;
  const opts = {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    foreignObjectRendering: true,
  };
  const canvas = await html2canvas(node, opts);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);

  // Mobilde yeni sekmede aç, masaüstünde indir
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    pdf.output("dataurlnewwindow");
  } else {
    pdf.save(filename);
  }
}

document.getElementById("savePdfBtn").addEventListener("click", async function () {
  const nextNum = consumeNext();
  const serialText = "AVS2025 / " + pad(nextNum, 5);
  const now = new Date();
  const dateText = now.toLocaleString("tr-TR");
  document.getElementById("faturaTarih").textContent = dateText;
  document.getElementById("faturaSeri").textContent = serialText;

  const printable = document.getElementById("invoiceRoot");
  const originalWidth = printable.style.width;
  printable.style.width = "900px";
  await generatePdfFromNode(printable, `Avis_EFatura_${serialText.replace(/\s+/g, "_").replace(/\//g, "-")}.pdf`);
  printable.style.width = originalWidth;
});
