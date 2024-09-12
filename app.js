const express = require('express');
const mongoose = require('mongoose');

// Inisialisasi Express
const app = express();

// Menghubungkan ke MongoDB
mongoose.connect('mongodb+srv://vercel-admin-user:vercel@clustermirongdev.331e4.mongodb.net/wa-bot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err.message);
});

// Definisikan Schema dan Model untuk koleksi 'cats'
const catSchema = new mongoose.Schema({
    name: String,
    age: Number
});
const Cat = mongoose.model('Cat', catSchema);

// Rute untuk Insert menggunakan GET
app.get('/insert', async (req, res) => {
    const { name, age } = req.query;

    // Validasi data
    if (!name || !age) {
        return res.status(400).json({ success: false, message: 'Name and age are required.' });
    }

    try {
        // Insert data ke MongoDB
        const newCat = new Cat({ name, age });
        await newCat.save();
        res.status(201).json({ success: true, message: 'Data inserted successfully!', data: newCat });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to insert data.', error: error.message });
    }
});

// Rute untuk View (GET)
app.get('/view', async (req, res) => {
    const { name, age } = req.query;

    try {
        // Jika ada filter name dan age
        let query = {};
        if (name) query.name = name;
        if (age) query.age = age;

        const cats = await Cat.find(query);
        
        // Jika data ditemukan
        if (cats.length > 0) {
            res.status(200).json({ success: true, data: cats });
        } else {
            res.status(404).json({ success: false, message: 'No data found.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve data.', error: error.message });
    }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
