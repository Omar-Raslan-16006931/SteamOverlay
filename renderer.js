const sourceSelect=document.getElementById('sourceSelect');
const refreshSources=document.getElementById('refreshSources');
const fromCur=document.getElementById('fromCur');
const toCur=document.getElementById('toCur');
const rate=document.getElementById('rate');
const interval=document.getElementById('interval');
const scanBtn=document.getElementById('scanBtn');
const lockBtn=document.getElementById('lockBtn');
const status=document.getElementById('status');
const minBtn=document.getElementById('minBtn');
const closeBtn=document.getElementById('closeBtn');

const CURRENCY_NAMES = {
  AED:'UAE Dirham', AFN:'Afghan Afghani', ALL:'Albanian Lek', AMD:'Armenian Dram', ANG:'Netherlands Antillean Guilder', AOA:'Angolan Kwanza', ARS:'Argentine Peso', AUD:'Australian Dollar',
  AWG:'Aruban Florin', AZN:'Azerbaijani Manat', BAM:'Bosnia-Herzegovina Mark', BBD:'Barbadian Dollar', BDT:'Bangladeshi Taka', BGN:'Bulgarian Lev', BHD:'Bahraini Dinar', BIF:'Burundian Franc',
  BMD:'Bermudan Dollar', BND:'Brunei Dollar', BOB:'Bolivian Boliviano', BRL:'Brazilian Real', BSD:'Bahamian Dollar', BTN:'Bhutanese Ngultrum', BWP:'Botswana Pula', BYN:'Belarusian Ruble',
  BZD:'Belize Dollar', CAD:'Canadian Dollar', CDF:'Congolese Franc', CHF:'Swiss Franc', CLP:'Chilean Peso', CNY:'Chinese Yuan', COP:'Colombian Peso', CRC:'Costa Rican Colon',
  CUP:'Cuban Peso', CVE:'Cape Verdean Escudo', CZK:'Czech Koruna', DJF:'Djiboutian Franc', DKK:'Danish Krone', DOP:'Dominican Peso', DZD:'Algerian Dinar', EGP:'Egyptian Pound',
  ERN:'Eritrean Nakfa', ETB:'Ethiopian Birr', EUR:'Euro', FJD:'Fijian Dollar', FKP:'Falkland Islands Pound', GBP:'British Pound', GEL:'Georgian Lari', GHS:'Ghanaian Cedi',
  GIP:'Gibraltar Pound', GMD:'Gambian Dalasi', GNF:'Guinean Franc', GTQ:'Guatemalan Quetzal', GYD:'Guyanese Dollar', HKD:'Hong Kong Dollar', HNL:'Honduran Lempira', HTG:'Haitian Gourde',
  HUF:'Hungarian Forint', IDR:'Indonesian Rupiah', ILS:'Israeli New Shekel', INR:'Indian Rupee', IQD:'Iraqi Dinar', IRR:'Iranian Rial', ISK:'Icelandic Krona', JMD:'Jamaican Dollar',
  JOD:'Jordanian Dinar', JPY:'Japanese Yen', KES:'Kenyan Shilling', KGS:'Kyrgyzstani Som', KHR:'Cambodian Riel', KMF:'Comorian Franc', KRW:'South Korean Won', KWD:'Kuwaiti Dinar',
  KZT:'Kazakhstani Tenge', LAK:'Lao Kip', LBP:'Lebanese Pound', LKR:'Sri Lankan Rupee', LRD:'Liberian Dollar', LSL:'Lesotho Loti', LYD:'Libyan Dinar', MAD:'Moroccan Dirham',
  MDL:'Moldovan Leu', MGA:'Malagasy Ariary', MKD:'Macedonian Denar', MMK:'Myanmar Kyat', MNT:'Mongolian Tugrik', MOP:'Macanese Pataca', MRU:'Mauritanian Ouguiya', MUR:'Mauritian Rupee',
  MVR:'Maldivian Rufiyaa', MWK:'Malawian Kwacha', MXN:'Mexican Peso', MYR:'Malaysian Ringgit', MZN:'Mozambican Metical', NAD:'Namibian Dollar', NGN:'Nigerian Naira', NIO:'Nicaraguan Cordoba',
  NOK:'Norwegian Krone', NPR:'Nepalese Rupee', NZD:'New Zealand Dollar', OMR:'Omani Rial', PAB:'Panamanian Balboa', PEN:'Peruvian Sol', PHP:'Philippine Peso', PKR:'Pakistani Rupee',
  PLN:'Polish Zloty', PYG:'Paraguayan Guarani', QAR:'Qatari Riyal', RON:'Romanian Leu', RSD:'Serbian Dinar', RUB:'Russian Ruble', RWF:'Rwandan Franc', SAR:'Saudi Riyal',
  SBD:'Solomon Islands Dollar', SCR:'Seychellois Rupee', SDG:'Sudanese Pound', SEK:'Swedish Krona', SGD:'Singapore Dollar', SLE:'Sierra Leonean Leone', SOS:'Somali Shilling', SRD:'Surinamese Dollar',
  SSP:'South Sudanese Pound', STN:'Sao Tome and Principe Dobra', SYP:'Syrian Pound', SZL:'Eswatini Lilangeni', THB:'Thai Baht', TJS:'Tajikistani Somoni', TMT:'Turkmen Manat', TND:'Tunisian Dinar',
  TOP:'Tongan Paanga', TRY:'Turkish Lira', TTD:'Trinidad and Tobago Dollar', TWD:'New Taiwan Dollar', TZS:'Tanzanian Shilling', UAH:'Ukrainian Hryvnia', UGX:'Ugandan Shilling', USD:'US Dollar',
  UYU:'Uruguayan Peso', UZS:'Uzbekistani Som', VES:'Venezuelan Bolivar', VND:'Vietnamese Dong', XAF:'Central African CFA Franc', XCD:'East Caribbean Dollar', XOF:'West African CFA Franc',
  XPF:'CFP Franc', YER:'Yemeni Rial', ZAR:'South African Rand', ZMW:'Zambian Kwacha'
};

Object.keys(CURRENCY_NAMES).forEach(c=>{fromCur.add(new Option(`${c} - ${CURRENCY_NAMES[c]}`,c));toCur.add(new Option(`${c} - ${CURRENCY_NAMES[c]}`,c));});
fromCur.value='UAH';
toCur.value='SAR';

async function loadSources(){
  sourceSelect.innerHTML='';
  const src=await window.api.listSources();
  src.forEach(s=>sourceSelect.add(new Option(`${s.type.toUpperCase()} - ${s.name}`,s.id)));
  status.textContent=src.length?'Sources loaded. Select Steam screen or window.':'No sources found.';
}

refreshSources.onclick=loadSources;
scanBtn.onclick=async()=>{
  const src=sourceSelect.value;
  if(!src){status.textContent='Pick a source first.';return;}
  await window.api.selectSource({id:src,type:src.startsWith('screen:')?'screen':'window',bounds:null});
  status.textContent='Scanning started. OCR and overlay pipeline running.';
  scanBtn.textContent='Scanning...';
};
lockBtn.onclick=async()=>{
  const locked=await window.api.toggleLock();
  lockBtn.textContent=locked?'Unlock overlay':'Lock overlay';
};
minBtn.onclick=()=>window.api.minimize();
closeBtn.onclick=()=>window.api.close();
window.api.onLock(v=>lockBtn.textContent=v?'Unlock overlay':'Lock overlay');
window.addEventListener('DOMContentLoaded',async()=>{
  await loadSources();
  lockBtn.textContent=(await window.api.getLock())?'Unlock overlay':'Lock overlay';
});