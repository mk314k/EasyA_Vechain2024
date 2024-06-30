const products = {
    '0x1': {
        class: 'onion',
        quant: 10,
        unit: 'kg'
    },
    '0x2': {
        class: 'tomato',
        quant: 5,
        unit: 'kg'
    },
    '0x3': {
        class: 'potato',
        quant: 20,
        unit: 'kg'
    },
    '0x4': {
        class: 'carrot',
        quant: 8,
        unit: 'kg'
    },
    '0x5': {
        class: 'broccoli',
        quant: 15,
        unit: 'kg'
    },
    '0x6': {
        class: 'cabbage',
        quant: 12,
        unit: 'kg'
    },
    '0x7': {
        class: 'spinach',
        quant: 7,
        unit: 'kg'
    },
    '0x8': {
        class: 'pepper',
        quant: 9,
        unit: 'kg'
    }
};

const ProductPage = () => {
    return (
        <>
            <div className='flex-horizontal product-container'>
                {Object.entries(products).map(([id, product]) => (
                    <div className='product' key={id}>
                        <p>Class: {product.class}</p>
                        <p>Quantity: {product.quant} {product.unit}</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default ProductPage;
