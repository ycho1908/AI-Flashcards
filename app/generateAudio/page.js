// attempt to generate transcript for audio file
'use client'

import { useUser } from "@clerk/nextjs"
import { db, storage } from "@/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Box, Button, Card, CardActionArea, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Stack, TextField, Typography } from "@mui/material"
import { collection, doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import Flashcard from "../flashcard/page"

export default function Generate2() {

    const [flashcards ,setFlashcards] = useState([])
    const [userInput, setUserInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [flipped, setFlipped] = useState({})
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")

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

    const [audioFile, setAudioFile] = useState(null)

    const handleFileChange = (e) => {
        setAudioFile(e.target.files[0])
    };

    const handleGenerate2 = async () => {
        if (!audioFile) {
            console.error("No audio file selected")
            return
        }

        try {

            const storageRef = ref(storage, `audioFiles/${audioFile.name}`);
            await uploadBytes(storageRef, audioFile);

            const audioURL = await getDownloadURL(storageRef);
            console.log("Audio uploaded to Firebase:", audioURL);

            // // ERROR with upload_file
            // const formData = new FormData()
            // formData.append("file", audioFile)
            // const uploadedAudioFile = await genAI.upload_file(formData)

            // const prompt = "Summarize the speech."
            const prompt = "Generate a transcript of the speech."

            const model = await genAI
                .getGenerativeModel({model: MODEL_NAME})
                .startChat({
                    generationConfig,
                    safetySettings,
                    history: [],
            })

            const response = await model.generateText({
                prompt,
                audioURL: audioURL
                // {
                //     "mime_type": audioFile.type,
                //     "data": audioURL
                // }
            })

            console.log("Generated Response:", response)
        } catch (error) {
            console.error("Error processing the audio file:", error);
        }
    }

    return (
        <Container maxWidth='md'>
         <Box sx={{mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
             <Typography variant='h4'>Note Taking Support</Typography>
             <Paper sx={{p: 4, width: '100%'}}>
                 <input type="file" accept="audio/*" label='Enter audio file' onChange={handleFileChange} />
                 <Button variant='contained' color='primary' style={{marginTop: '20px'}} onClick={handleGenerate2} fullWidth>Generate Transcript</Button>
             </Paper>
         </Box>

        {/* <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Save Flashcards</DialogTitle>
            <DialogContent>
                <DialogContentText>Please enter a name for your flashcards collection</DialogContentText>
                <TextField autoFocus margin='dense' label='collection Name' type='text' fullWidth value={name} onChange={(e) => setName(e.target.value)} variant='outlined'/>
             </DialogContent>
             <DialogActions>
                 <Button onClick={handleClose}>Cancel</Button>
                 <Button onClick={saveFlashcard}>Save</Button>
             </DialogActions>
         </Dialog> */}
     </Container>
    )
}