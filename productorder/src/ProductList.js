import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderPackages, setOrderPackages] = useState([]);
  
  // fetch products from api  
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.log('Error fetching products:', error));
  }, []);
  
  useEffect(()=>{
    document.title=`Product List`
  });

  const handleSelectItem = (itemName) => {
    const index = selectedItems.indexOf(itemName);
    if (index === -1) {
      setSelectedItems([...selectedItems, itemName]);
    } else {
      setSelectedItems(selectedItems.filter((name) => name !== itemName));
    }
  };

  const calculateCourierCharge = (weight) => {
    if (weight <= 200) {
      return 5;
    } else if (weight <= 500) {
      return 10;
    } else if (weight <= 1000) {
      return 15;
    } else if (weight <= 5000) {
      return 20;
    } else {
      return 0;
    }
  };

  const handlePlaceOrder = () => {
  const selectedProducts = products.filter((product) =>
    selectedItems.includes(product.name)
  );

  const maxPackageCost = 250;
  const orderPackages = [];

  // sort products by heaviest weight first
  selectedProducts.sort((a, b) => b.weight - a.weight);

  selectedProducts.forEach((product) => {
    // try to add the product to an existing package
    let bestPackage = null;
    let minIncreaseCost = Infinity;

    orderPackages.forEach((currentPackage) => {
      const remainingCapacity = maxPackageCost - currentPackage.totalPrice;
      const increaseCost = calculateCourierCharge(currentPackage.totalWeight + product.weight) - currentPackage.courierPrice;

      if (increaseCost < minIncreaseCost && remainingCapacity >= product.price) {
        bestPackage = currentPackage;
        minIncreaseCost = increaseCost;
      }
    });

    if (bestPackage && minIncreaseCost !== Infinity) {
      // add product to best package found
      bestPackage.items.push(product);
      bestPackage.totalWeight += product.weight;
      bestPackage.totalPrice += product.price;
      bestPackage.courierPrice = calculateCourierCharge(bestPackage.totalWeight);
    } else {
      // create new package with current package
      const newPackage = {
        items: [product],
        totalWeight: product.weight,
        totalPrice: product.price,
        courierPrice: calculateCourierCharge(product.weight),
      };
      orderPackages.push(newPackage);
    }
  });

  setOrderPackages(orderPackages);
};
  
  

  return (
    <div>
      <h2>Product List</h2>
      <ul>
        {products.map((product) => (
          <li key={product.name}>
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes(product.name)}
                onChange={() => handleSelectItem(product.name)}
              />
              {`${product.name} - $${product.price} - ${product.weight}g`}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handlePlaceOrder}>Place Order</button>
  
      {orderPackages.length > 0 && (
        <div>
          <h2>Order Details</h2>
          {orderPackages.map((packageData, index) => (
            <div key={index}>
              <h3>Package {index + 1}</h3>
              <p>
              <strong>Items - </strong>
                {packageData.items.map((item, index) => (
                <React.Fragment key={item.name}>
                {index > 0 && ', '} 
                {item.name}
                </React.Fragment>

                ))}
                <br/>
                <strong>Total weight - </strong> {packageData.totalWeight}g
                <br />
                <strong>Total price - </strong> ${packageData.totalPrice}
                <br />
                <strong>Courier price - </strong> ${packageData.courierPrice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
};

export default ProductList;
