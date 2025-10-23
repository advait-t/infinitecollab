export function downloadURI(uri:string, name:string){
  const a = document.createElement('a');
  a.href = uri; a.download = name; a.click();
}
