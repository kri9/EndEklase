import { getRequest } from "./api";


export const handleDownloadPDFAdmin = async (invoiceId: number) => {
  _handleDownloadPDF(invoiceId, `admin/invoice/${invoiceId}/pdf`)
}
export const handleDownloadPDF = async (invoiceId: number) => {
  _handleDownloadPDF(invoiceId, `user/invoice/${invoiceId}/pdf`)
};

const _handleDownloadPDF = async (invoiceId: number, endpointURL: string) => {
  try {
    const blob = await getRequest<any>(endpointURL);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${invoiceId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Ошибка при скачивании PDF:", error);
  }
};

