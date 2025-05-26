const { readFileSync } = require('fs');
const { get } = require('https');

    function formatarMoeda(valor) {
      return new Intl.NumberFormat("pt-BR",
        { style: "currency", currency: "BRL",
          minimumFractionDigits: 2 }).format(valor/100);
    }

    function getPeca(pecas, apre) {
        return pecas[apre.id];
    }

    function calcularCredito(pecas, apre) {
      // créditos para próximas contratações
        let creditos = 0;
        creditos += Math.max(apre.audiencia - 30, 0);
        if (getPeca(pecas, apre).tipo === "comedia") 
          creditos += Math.floor(apre.audiencia / 5);
        return creditos;
    }

    function calcularTotalCreditos(pecas, apresentacoes) {
      creditos = 0;
      for (let apre of apresentacoes) {
        creditos += calcularCredito(pecas, apre);
      }
      return creditos;
    }

    function calcularTotalFatura(pecas, apresentacoes) {
      let total = 0;
      for (let apre of apresentacoes) {
        total += calcularTotalApresentacao(pecas, apre);
      }
      return total;
    }

    function calcularTotalApresentacao(pecas, apre){
        let total = 0;
  
        const peca = getPeca(pecas, apre);
        switch (peca.tipo) {
        case "tragedia":
          total = 40000;
          if (apre.audiencia > 30) {
            total += 1000 * (apre.audiencia - 30);
          }
          break;
        case "comedia":
          total = 30000;
          if (apre.audiencia > 20) {
            total += 10000 + 500 * (apre.audiencia - 20);
          }
          total += 300 * apre.audiencia;
          break;
        default:
            throw new Error(`Peça desconhecia: ${getPeca(pecas, apre).tipo}`);
        }
          return total;
        
    }

    
function gerarFaturaStr (fatura, pecas) {

    let faturaStr = `Fatura ${fatura.cliente}\n`;

    for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
    }

    faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr; 
  }

function gerarFaturaHTML(fatura, pecas) {
  console.log(fatura);
  console.log(pecas);
  let html = `
<html>
<p> Fatura ${fatura.cliente} </p>
<ul>
${
fatura.apresentacoes.map(apre => 
{
return `<li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
}).join('')
}
</ul>
<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>
<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>
</html>
`
  return html;

}  


const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaStr);
console.log(faturaHTML);
