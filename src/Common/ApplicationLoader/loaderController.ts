export const showLoader = () => {
  const element = document.getElementById("app-loader-overlay");
  if(!element) return;

  element.style.display = "flex";
}


export const hideLoader = () => {
  const element = document.getElementById("app-loader-overlay");
  if(!element) return;

  element.style.display = "none";
}