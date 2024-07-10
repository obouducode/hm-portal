import { generate } from '@pdfme/generator';
import HMPDF from '@/hm_inscription.json'

export async function generatePDF (inputs: Record<string, any>) {
  const pdf = await generate({
    template: HMPDF,
    inputs:  [{
      'membership_lastname': 'DARTIGUES',
      'membership_firstname': 'Mathieu',
      'membership_address': '3 Villeneuve',
      'membership_zipcode': '44130',
      'membership_city': 'Notre dame des landes',
      'membership_tel': '0909090909',
      'membership_email': 'mathieu@dartic.fr'
    }]
  })

  // Browser
  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob));
}

