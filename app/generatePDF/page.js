// attempt to generate summary for PDF file
'use client'

import { useUser } from "@clerk/nextjs"
import { db } from "@/firebase"
import { Box, Button, Card, CardActionArea, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Stack, TextField, Typography } from "@mui/material"
import { collection, doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import Flashcard from "../flashcard/page"
import { PDFDocument } from "pdf-lib"
import * as pdfjsLib from 'pdfjs-dist'

export default function Generate() {

    const [pdfFile, setPdfFile] = useState(null)
    const [pdfSummary, setPdfSummary] = useState("")

    // const [flashcards ,setFlashcards] = useState([])
    // const [userInput, setUserInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    // const [flipped, setFlipped] = useState({})
    // const [open, setOpen] = useState(false)
    // const [name, setName] = useState("")

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
    const MODEL_NAME = 'gemini-1.5-flash'

    const genAI = new GoogleGenerativeAI(API_KEY)

    const generationConfig = {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024,
    }

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ]

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    }

    // CAUSE OF THE ERROR
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.min.js';
    }, [])       
    

    const extractText = async (file) => {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        let text = '';
        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }
        return text;
    }

    const handleGenerate = async () => {
        if (!pdfFile) {
            console.error("No PDF file selected");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const extractedText = await extractText(pdfFile);
            console.log("Extracted Text:", extractedText);

            const prompt = `Please summarize the following text extracted from the PDF provided by the user:\n\n${extractedText}`;

            const chat = await genAI
                .getGenerativeModel({ model: MODEL_NAME })
                .startChat({
                    generationConfig,
                    safetySettings,
                    history: [],
                })

            const result = await chat.sendMessage(prompt);
            const responseText = result.response.text();

            console.log('Generated Summary:', responseText);
            setPdfSummary(responseText);
        } catch (error) {
            console.error("Error processing the PDF file:", error);
            setError('Failed to generate summary.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container maxWidth='md'>
            <Box sx={{ mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant='h4'>PDF Summarizer</Typography>
                <Paper sx={{ p: 4, width: '100%' }}>
                    <input type="file" accept="application/pdf" onChange={handleFileChange} />
                    <Button variant='contained' color='primary' onClick={handleGenerate} fullWidth sx={{ mt: 2 }}>
                        Generate Summary
                    </Button>
                </Paper>
                {loading && <Typography variant='body1' sx={{ mt: 2 }}>Loading...</Typography>}
                {error && <Typography color='error' sx={{ mt: 2 }}>{error}</Typography>}
                {pdfSummary && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant='h5'>Summary:</Typography>
                        <Typography>{pdfSummary}</Typography>
                    </Box>
                )}
            </Box>
        </Container>
    )
}