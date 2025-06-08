import express, { Request, Response, NextFunction } from 'express'

const app = express()
app.use(express.json())

const port: number = parseInt(process.env.PORT || '3000', 10)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!')
})

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' })
})

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})