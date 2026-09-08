export function imageInfo(bytes:Uint8Array){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let width=0,height=0,ext='',type='';
 if(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)){width=view.getUint32(16);height=view.getUint32(20);ext='png';type='image/png';}
 else if(bytes.length>=30&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){
  const kind=String.fromCharCode(...bytes.slice(12,16));ext='webp';type='image/webp';
  if(kind==='VP8X'){width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);}
  else if(kind==='VP8 '){width=view.getUint16(26,true)&16383;height=view.getUint16(28,true)&16383;}
  else if(kind==='VP8L'&&bytes[20]===47){width=1+bytes[21]+((bytes[22]&63)<<8);height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);}
 }else if(bytes[0]===255&&bytes[1]===216){ext='jpg';type='image/jpeg';let offset=2;while(offset+9<bytes.length){if(bytes[offset]!==255){offset++;continue;}const marker=bytes[offset+1];if(marker===217||marker===218)break;if(marker===216||marker===1||(marker>=208&&marker<=215)){offset+=2;continue;}const length=view.getUint16(offset+2);if(length<2||offset+2+length>bytes.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){height=view.getUint16(offset+5);width=view.getUint16(offset+7);break;}offset+=2+length;}}
 if(!width||!height||width>20000||height>20000||width*height>100000000)throw Error('Şəkil ölçüsü və ya formatı düzgün deyil.');return {width,height,ext,type};
}
