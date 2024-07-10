import { generate } from '@pdfme/generator';
import HMPDF from '@/hm_inscription.json'

export async function generatePDF (inputs: Record<string, any>) {
  const pdf = await generate({
    template: HMPDF,
    inputs:  [inputs]
  })

  // Browser
  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob));
}

