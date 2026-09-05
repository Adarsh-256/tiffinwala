const quantityInput = document.getElementById("quantity");
const totalPrice = document.getElementById("totalPrice");

if (quantityInput && totalPrice) {

    const pricePerItem = Number(quantityInput.dataset.price);

    quantityInput.addEventListener("input", function () {

        const quantity = Number(this.value) || 1;

        const total = pricePerItem * quantity;

        totalPrice.textContent = total;
    });
}