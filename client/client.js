const handleResponse = (xhr) =>{
        
}

const sendAjax = (url) => {
const xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.setRequestHeader ("Accept", 'Application/json');

xhr.onload = () => handleResponse(xhr);

xhr.send();
};

const init = () => {
  // add Event Listeners
  sendAjax('/');
};

window.onload = init;