const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// Path to data.json
const dataPath = path.join(__dirname, 'data.json');

// Helper function to read data
function readData() {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error reading data.json:', err);
        return { products: [], blogs: [] };
    }
}

// Helper function to write data
function writeData(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing to data.json:', err);
        return false;
    }
}

// Verify admin password
function verifyAdmin(password) {
    return password === 'admin123';
}

// Save Base64 image and return filename
function saveBase64Image(base64Data, fileName) {
    try {
        // Extract base64 data - handle different data URI formats
        let base64String = base64Data;
        if (base64Data.includes(',')) {
            base64String = base64Data.split(',')[1];
        }
        
        // Validate base64
        if (!base64String || base64String.length === 0) {
            console.error('Invalid base64 data');
            return null;
        }
        
        const buffer = Buffer.from(base64String, 'base64');
        
        // Create unique filename
        const timestamp = Date.now();
        let ext = path.extname(fileName);
        if (!ext) ext = '.jpg'; // default extension
        const uniqueName = `img_${timestamp}${ext}`;
        const filePath = path.join(uploadsDir, uniqueName);
        
        // Save file
        fs.writeFileSync(filePath, buffer);
        return uniqueName;
    } catch (err) {
        console.error('Error saving image:', err);
        return null;
    }
}

// GET all products
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// GET all blogs
app.get('/api/blogs', (req, res) => {
    const data = readData();
    res.json(data.blogs);
});

// POST - Add new product (admin)
app.post('/api/products', (req, res) => {
    const { name, description, price, image, fileName, password } = req.body;

    if (!verifyAdmin(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !description || !price || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Save image and get filename
        const savedFileName = saveBase64Image(image, fileName || 'image.jpg');
        
        if (!savedFileName) {
            return res.status(500).json({ error: 'Failed to save image' });
        }

        const data = readData();
        const newId = Math.max(...data.products.map(p => p.id), 0) + 1;

        const newProduct = {
            id: newId,
            name,
            description,
            price: parseInt(price),
            image: savedFileName
        };

        data.products.push(newProduct);

        if (writeData(data)) {
            res.status(201).json(newProduct);
        } else {
            res.status(500).json({ error: 'Failed to save product' });
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// DELETE - Delete product (admin)
app.delete('/api/products/:id', (req, res) => {
    const { password } = req.body;
    const productId = parseInt(req.params.id);

    if (!verifyAdmin(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = readData();
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== productId);

    if (data.products.length < initialLength) {
        if (writeData(data)) {
            res.json({ success: true, message: 'Product deleted' });
        } else {
            res.status(500).json({ error: 'Failed to delete product' });
        }
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// PUT - Update product (admin)
app.put('/api/products/:id', (req, res) => {
    const { name, description, price, image, fileName, password } = req.body;
    const productId = parseInt(req.params.id);

    if (!verifyAdmin(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !description || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const data = readData();
        const productIndex = data.products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update basic fields
        data.products[productIndex].name = name;
        data.products[productIndex].description = description;
        data.products[productIndex].price = parseInt(price);

        // Update image only if provided
        if (image) {
            const savedFileName = saveBase64Image(image, fileName || 'image.jpg');
            if (!savedFileName) {
                return res.status(500).json({ error: 'Failed to save image' });
            }
            data.products[productIndex].image = savedFileName;
        }

        if (writeData(data)) {
            res.json(data.products[productIndex]);
        } else {
            res.status(500).json({ error: 'Failed to update product' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// POST - Add new blog (admin)
app.post('/api/blogs', (req, res) => {
    const { title, excerpt, date, image, fileName, password } = req.body;

    if (!verifyAdmin(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !excerpt || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Save image and get filename
        const savedFileName = saveBase64Image(image, fileName || 'image.jpg');
        
        if (!savedFileName) {
            return res.status(500).json({ error: 'Failed to save image' });
        }

        const data = readData();
        const newId = Math.max(...data.blogs.map(b => b.id), 0) + 1;

        let blogDate = date;
        if (!blogDate) {
            const today = new Date();
            blogDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }

        const newBlog = {
            id: newId,
            title,
            excerpt,
            date: blogDate,
            image: savedFileName
        };

        data.blogs.push(newBlog);

        if (writeData(data)) {
            res.status(201).json(newBlog);
        } else {
            res.status(500).json({ error: 'Failed to save blog' });
        }
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// DELETE - Delete blog (admin)
app.delete('/api/blogs/:id', (req, res) => {
    const { password } = req.body;
    const blogId = parseInt(req.params.id);

    if (!verifyAdmin(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = readData();
    const initialLength = data.blogs.length;
    data.blogs = data.blogs.filter(b => b.id !== blogId);

    if (data.blogs.length < initialLength) {
        if (writeData(data)) {
            res.json({ success: true, message: 'Blog deleted' });
        } else {
            res.status(500).json({ error: 'Failed to delete blog' });
        }
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

// PUT - Update blog (admin)
app.put('/api/blogs/:id', (req, res) => {
    const { title, excerpt, date, image, fileName, password } = req.body;
    const blogId = parseInt(req.params.id);

    if (!verifyAdmin(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !excerpt) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const data = readData();
        const blogIndex = data.blogs.findIndex(b => b.id === blogId);

        if (blogIndex === -1) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Update basic fields
        data.blogs[blogIndex].title = title;
        data.blogs[blogIndex].excerpt = excerpt;

        // Update date if provided
        if (date) {
            data.blogs[blogIndex].date = date;
        }

        // Update image only if provided
        if (image) {
            const savedFileName = saveBase64Image(image, fileName || 'image.jpg');
            if (!savedFileName) {
                return res.status(500).json({ error: 'Failed to save image' });
            }
            data.blogs[blogIndex].image = savedFileName;
        }

        if (writeData(data)) {
            res.json(data.blogs[blogIndex]);
        } else {
            res.status(500).json({ error: 'Failed to update blog' });
        }
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Luxacom Interior Store server running on http://localhost:${PORT}`);
    console.log('Admin password: admin123');
});
