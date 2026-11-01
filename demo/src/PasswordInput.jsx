import React,{useEffect,useState} from 'react';

export default function PasswordInput({lang,value,...props}){
 const [shown,setShown]=useState(false);
 useEffect(()=>{if(!value)setShown(false);},[value]);
 const label=lang==='my'?(shown?'ဖျောက်မယ်':'ပြမယ်'):(shown?'Hide':'Show');
 const accessible=lang==='my'?(shown?'စကားဝှက် ဖျောက်မယ်':'စကားဝှက် ပြမယ်'):(shown?'Hide password':'Show password');
 return <div className="password-field"><input {...props} value={value} type={shown?'text':'password'}/><button type="button" className="password-toggle" aria-label={accessible} aria-controls={props.id} aria-pressed={shown} onClick={()=>setShown(current=>!current)}>{label}</button></div>;
}
