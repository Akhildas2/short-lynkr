import express from 'express';
import cors from 'cors';

const app = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})