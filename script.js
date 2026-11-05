(function(){
"use strict";
var DB=[{l:"C in γ-Fe (FCC Austenite)",sp:"C",ho:"γ-Fe (FCC)",me:"Interstitial",d0:2.30e-5,q:148.0},{l:"C in α-Fe (BCC Ferrite)",sp:"C",ho:"α-Fe (BCC)",me:"Interstitial",d0:6.20e-7,q:80.0},{l:"N in α-Fe (BCC Ferrite)",sp:"N",ho:"α-Fe (BCC)",me:"Interstitial",d0:5.00e-7,q:77.0},{l:"Fe in α-Fe (BCC Self-Diffusion)",sp:"Fe",ho:"α-Fe (BCC)",me:"Substitutional",d0:2.80e-4,q:251.0},{l:"Fe in γ-Fe (FCC Self-Diffusion)",sp:"Fe",ho:"γ-Fe (FCC)",me:"Substitutional",d0:5.00e-5,q:284.0},{l:"Cu in Al (FCC)",sp:"Cu",ho:"Al (FCC)",me:"Substitutional",d0:6.50e-5,q:136.0},{l:"Mg in Al (FCC)",sp:"Mg",ho:"Al (FCC)",me:"Substitutional",d0:1.20e-4,q:130.0},{l:"Zn in Cu (FCC Brass)",sp:"Zn",ho:"Cu (FCC)",me:"Substitutional",d0:2.40e-5,q:189.0},{l:"Cu in Cu (FCC Self-Diffusion)",sp:"Cu",ho:"Cu (FCC)",me:"Substitutional",d0:7.80e-5,q:211.0},{l:"Al in Al (FCC Self-Diffusion)",sp:"Al",ho:"Al (FCC)",me:"Substitutional",d0:2.30e-4,q:144.0}];

var T=Math.sqrt(Math.PI),K=2/T;
function erfc(x){var z=Math.abs(x),t=1/(1+.5*z),r=t*Math.exp(-z*z-1.26551223+t*(1.00002368+t*(.37409196+t*(.09678418+t*(-.18628806+t*(.27886807+t*(-1.13520398+t*(1.48851587+t*(-.82215223+t*.17087277)))))))));return x>=0?r:2-r}
function erf(x){return 1-erfc(x)}
function erfinv(y){
 if(y===0)return 0; if(y>=1)return 1/0; if(y<=-1)return -1/0;
 var a=.147,L=Math.log(1-y*y),u=2/(Math.PI*a)+L/2,i=u*u-L/a;
 if(i<0)i=0;
 var z=(y<0?-1:1)*Math.sqrt(Math.sqrt(i)-u),k,d,s;
 for(k=0;k<8;k++){d=K*Math.exp(-z*z); if(!(d>1e-300))break; s=(erf(z)-y)/d; z-=s; if(Math.abs(s)<1e-13)break}
 return z}
function fmt(n){
 if(n==null||!isFinite(n))return"—"; if(n===0)return"0";
 var a=Math.abs(n);
 if(a>=1e6||a<1e-3){var e=n.toExponential(4).split("e");return parseFloat(e[0])+"e"+e[1]}
 if(a>=100)return parseFloat(n.toFixed(3))+"";
 if(a>=1)return parseFloat(n.toFixed(5))+"";
 return parseFloat(n.toFixed(6))+""
}
var $=function(i){return document.getElementById(i)};
var sel=$("dbSelect"),info=$("dbInfo"),tempInput=$("dbTemp"),dInput=$("d");
DB.forEach(function(item,i){var o=document.createElement("option");o.value=i;o.textContent=item.l;sel.appendChild(o)});
function updateDB(){
 var i=sel.value; if(i===""){info.classList.remove("show");info.innerHTML="";return}
 var item=DB[i],temp=tempInput.value;
 var R=8.314,T=parseFloat(temp)+273.15;
 var d=item.d0*Math.exp(-(item.q*1000)/(R*T));
 var h="<div><span>Species:</span><span>"+item.sp+"</span></div><div><span>Host:</span><span>"+item.ho+"</span></div><div><span>Mechanism:</span><span>"+item.me+"</span></div><div><span>D₀ (m²/s):</span><span>"+item.d0.toExponential(2)+"</span></div><div><span>Q (kJ/mol):</span><span>"+item.q+"</span></div>";
 if(!isNaN(d)){h+="<div style='color:var(--rs);font-weight:bold'><span>D @ "+temp+"°C:</span><span>"+d.toExponential(3)+" m²/s</span></div>"; dInput.value=d.toExponential(3);}
 info.innerHTML=h;info.classList.add("show");
}
sel.addEventListener("change",updateDB); tempInput.addEventListener("input",updateDB);

var F=["c0","cs","cx","x","d","t"],U={c0:"wt%",cs:"wt%",cx:"wt%",x:"mm",d:"m²/s",t:"h"},S={c0:"C₀",cs:"Cₛ",cx:"Cₓ",x:"x",d:"D",t:"t"};
var out=$("out");
function show(h,e){out.hidden=false; out.className=e?"err":""; out.innerHTML=h}
function err(msg){show('<div class="lb">// error</div><div class="val">'+msg+'</div>',1)}
function calc(){
 var v={},b=[],i,k,r,n;
 for(i=0;i<6;i++){k=F[i]; r=$(k).value.trim().replace(/[\s,]/g,"");
  if(r===""){v[k]=null;b.push(k)}
  else{n=Number(r); if(!isFinite(n))return err("Invalid number for "+S[k]); v[k]=n}}
 if(b.length!==1)return err(b.length===0?"All fields are filled. Clear one field.":"Exactly one field must be empty ("+b.length+" are empty).");
 var m=b[0],st=[],z,Y,res,ts,xm,sq;
 if(v.c0==null||v.cs==null||v.cx==null){
  if(v.x==null||v.d==null||v.t==null)return err("To solve for a concentration, x, D and t are required.");
  if(!(v.x>0&&v.d>0&&v.t>0))return err("x, D and t must be > 0.");
  xm=v.x/1000; ts=v.t*3600; sq=Math.sqrt(v.d*ts); z=xm/(2*sq); Y=1-erf(z);
  st.push(["x",fmt(xm)+" m"],["√(D·t)",fmt(sq)+" m"],["z",fmt(z)],["erf(z)",fmt(erf(z))],["Y = 1 − erf(z)",fmt(Y)]);
  if(m==="cx"){res=v.c0+Y*(v.cs-v.c0); st.push(["Cₓ",fmt(res)+" wt%"])}
  else if(m==="c0"){if(Math.abs(1-Y)<1e-12)return err("1 − Y = 0 → undefined."); res=(v.cx-Y*v.cs)/(1-Y); st.push(["C₀",fmt(res)+" wt%"])}
  else{if(Math.abs(Y)<1e-12)return err("Y = 0 → undefined."); res=v.c0+(v.cx-v.c0)/Y; st.push(["Cₛ",fmt(res)+" wt%"])}
 }else{
  if(v.cs===v.c0)return err("Cₛ and C₀ must differ.");
  Y=(v.cx-v.c0)/(v.cs-v.c0); st.push(["Y",fmt(Y)]);
  if(!(1-Y>-1&&1-Y<1))return err("No solution: 1−Y = "+fmt(1-Y)+" is outside erf(z).");
  z=erfinv(1-Y); st.push(["erf(z) = 1 − Y",fmt(1-Y)],["z = erf⁻¹(1−Y)",fmt(z)]);
  if(m==="t"){
   if(!(v.x>0&&v.d>0))return err("x and D must be > 0.");
   if(Math.abs(z)<1e-12)return err("z = 0 → infinite time.");
   xm=v.x/1000; ts=xm*xm/(4*z*z*v.d); res=ts/3600;
   st.push(["x",fmt(xm)+" m"],["t",fmt(ts)+" s"]);
  }else if(m==="x"){
   if(!(v.d>0&&v.t>0))return err("D and t must be > 0.");
   sq=Math.sqrt(v.d*v.t*3600); res=2*z*sq*1000;
   st.push(["√(D·t)",fmt(sq)+" m"],["x",fmt(2*z*sq)+" m"]);
  }else{
   if(!(v.x>0&&v.t>0))return err("x and t must be > 0.");
   if(Math.abs(z)<1e-12)return err("z = 0 → undefined.");
   xm=v.x/1000; ts=v.t*3600; res=xm*xm/(4*z*z*ts);
   st.push(["t",fmt(ts)+" s"],["D",fmt(res)+" m²/s"]);
  }
 }
 var h='<div class="lb">solved for · '+S[m]+'</div><div class="val">'+S[m]+' = '+fmt(res)+'<small>'+U[m]+'</small></div><div class="st">';
 for(i=0;i<st.length;i++)h+="<div><span>"+st[i][0]+"</span><span>"+st[i][1]+"</span></div>";
 show(h+"</div>",0);
}
$("go").onclick=calc;
$("cl").onclick=function(){for(var i=0;i<6;i++)$(F[i]).value=""; out.hidden=true; out.innerHTML=""};
$("ex").onclick=function(){var e={c0:"0.25",cs:"1.20",cx:"0.80",x:"0.50",d:"1.6e-11",t:""};for(var i=0;i<6;i++)$(F[i]).value=e[F[i]];out.hidden=true};
$("tb").onclick=function(){var w=$("tw"),b=$("tb"); if(w.hidden){w.hidden=false;b.className="on";b.textContent="▾ Hide erf(z) Table"}else{w.hidden=true;b.className="";b.textContent="▸ Show erf(z) Table"}};
for(var i=0;i<6;i++)$(F[i]).addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();calc()}});
var rows=[],j,zz,ee;
for(j=0;j<=60;j+=2){zz=j*0.05;ee=erf(zz);rows.push("<tr><td>"+zz.toFixed(2)+"</td><td>"+ee.toFixed(5)+"</td><td>"+(1-ee).toFixed(5)+"</td></tr>")}
$("tbody").innerHTML=rows.join("");
})();
