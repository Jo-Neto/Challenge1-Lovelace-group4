function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.visibility = "visible";
}

function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.visibility = "hidden";
}