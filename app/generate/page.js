'use client'

import { useUser } from "@clerk/nextjs"
import { db } from "@/firebase"
import { Box, Button, Card, CardActionArea, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Stack, TextField, Typography } from "@mui/material"
import { collection, doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import Flashcard from "../flashcard/page"

export default function Generate() {
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

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setError(null)

            const chat = await genAI
                .getGenerativeModel({model: MODEL_NAME})
                .startChat({
                    generationConfig,
                    safetySettings,
                    history: [],
                })

            const prompt = `Generate a set of flashcards for the topic: ${userInput}. Each flashcard must have the term for the front and brief explanation or definition for the back, separated by ':' 
            For example, 
            1. **Front:** <term>
            2. **Back:** <definition>

            Use double newlines to separate each flashcard. Do not include any extra text, bullet points, or formatting other than the specified format. Example format:

            **Front:** Mercury
            **Back:** The smallest and innermost planet in the solar system. Known for its extreme temperature swings and cratered surface. (credit: NASA)

            **Front:** Venus
            **Back:** The second planet from the Sun and Earth's closest planetary neighbor. Often called Earth's "twin" due to its similar size and mass, but has a scorching hot surface and a dense, toxic atmosphere. (credit: NASA)`
            const result = await chat.sendMessage(prompt)

            const responseText = result.response.text()

            console.log('Raw Response Text:', responseText);

            const sections = responseText.trim().split('\n\n');
            console.log('Sections:', sections); // Log sections to verify splitting

            // Process each section to create flashcards
            const flashcards = sections.map(section => {
                // Split the section by newline and trim each line
                const lines = section.split('\n').map(line => line.trim());
                console.log('Lines:', lines); // Log lines to verify content

                if (lines.length >= 2) {
                    // Extract front and back parts
                    const front = lines[0].replace(/^\*\*Front:\*\*\s*/, '').trim();
                    const back = lines[1].replace(/^\*\*Back:\*\*\s*/, '').trim();

                    // Return the flashcard object
                    return { front, back };
                }
                return null;
            }).filter(card => card !== null);

            console.log('Parsed flashcards: ', flashcards)
            setFlashcards(flashcards)
        } catch (error) {
            setError('failed to generate flashcards.')
        } finally {
            setLoading(false)
        }
    }

    // const handleFlip = (index) => {
    //     setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
    // }

    const handleFlip = (id) => {
        setFlipped ((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const saveFlashcard = () => {
        console.log('Saving flashcards: ', name)
        handleClose()
    }

    return (
        <Container maxWidth='md'>
         <Box sx={{mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
             <Typography variant='h4'>Generate Flashcards</Typography>
             <Paper sx={{p: 4, width: '100%'}}>
                 <TextField value={userInput} onChange={(e) => setUserInput(e.target.value)} label='Enter text' fullWidth multiline rows={4} variant='outlined' sx={{mb: 2,}}/>
                 <Button variant='contained' color='primary' onClick={handleGenerate} fullWidth>Generate</Button>
             </Paper>
         </Box>

         {flashcards.length > 0 && (
            <Box sx={{ mt: 4 }}>
                <Typography variant='h5'>Flashcards Preview</Typography>
                <Grid container spacing={3} justifyContent="center">
                    {flashcards.map((flashcard, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ position: 'relative', height: '200px', width: '100%', perspective: '1000px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <CardActionArea onClick={() => handleFlip(index)} sx={{ height: '100%', width: '100%' }}>
                                    <CardContent sx={{ p: 0, height: '100%', width: '100%' }}>
                                        <Box sx={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            transformStyle: 'preserve-3d',
                                            transition: 'transform 0.6s',
                                            transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                        }}>
                                            {/* Front Face */}
                                            <Box sx={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: 'white',
                                                border: '1px solid #ddd',
                                                padding: 2,
                                                boxSizing: 'border-box',
                                            }}>
                                                <Typography variant='h6' align='center'>
                                                    {flashcard.front}
                                                </Typography>
                                            </Box>

                                            {/* Back Face */}
                                            <Box sx={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#f5f5f5',
                                                border: '1px solid #ddd',
                                                padding: 2,
                                                boxSizing: 'border-box',
                                            }}>
                                                <Typography variant='h6' align='center'>
                                                    {flashcard.back}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center'}}>
                    <Button variant='contained' color='secondary' onClick={handleOpen}>
                        Save
                    </Button>
                </Box>
            </Box>
        )}

        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Save Flashcards</DialogTitle>
            <DialogContent>
                <DialogContentText>Please enter a name for your flashcards collection</DialogContentText>
                <TextField autoFocus margin='dense' label='collection Name' type='text' fullWidth value={name} onChange={(e) => setName(e.target.value)} variant='outlined'/>
             </DialogContent>
             <DialogActions>
                 <Button onClick={handleClose}>Cancel</Button>
                 <Button onClick={saveFlashcard}>Save</Button>
             </DialogActions>
         </Dialog>
     </Container>
    )
}


// // GROQ IMPLEMENTATION
// const {isLoaded, isSignedIn, user} = useUser()
// const [flashcards, setFlashcards] = useState([])
// const [flipped, setFlipped] = useState([])
// const [text, setText] = useState('')
// const [name, setName] = useState('')
// const [open, setOpen] = useState(false)
// const router = useRouter()

// const handleSubmit = async () => {
//     try {
//         const response = await fetch('http://localhost:3000/generate', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ prompt: text, user_id: user.id }),
//         })

//         if (!response.ok) {
//             throw new Error('Failed to generate flashcards')
//         }

//         const data = await response.json()
//         setFlashcards(data.flashcards)
//     } catch (error) {
//         console.error(error)
//         alert('Error generating flashcards')
//     }

//     // OPEN AI IMPLEMENTATION
//     // fetch('api/generate', {
//     //     method: 'POST',
//     //     body: text, 
//     // })
//     // .then((res) => res.json())
//     // .then(data => setFlashcards(data))
// }

// const handleCardClick = (id) => {
//     setFlipped ((prev) => ({
//         ...prev,
//         [id]: !prev[id],
//     }))
// }

// const handleOpen = () => {
//     setOpen(true)
// }
// const handleClose = () => {
//     setOpen(false)
// }

// const saveFlashcards = async () => {
//     if (!name) {
//         alert('Please enter a name')
//         return 
//     }

//     const batch = writeBatch(db)
//     const userDocRef = doc(collection(db, 'users'), user.id)
//     const docSnap = await getDoc(userDocRef)

//     if (docSnap.exists()) {
//         const collections = docSnap.data().flashcards || []
//         if (collections.find((f) => f.name === name)) {
//             alert('Flashcard collection with the same name already exists.')
//             return
//         }
//         else {
//             collections.push({name})
//             batch.set(userDocRef, {flashcards: collections}, {merge: true})
//         }
//     }
//     else {
//         batch.set(userDocRef, {flaschards: [{name}]})
//     }

//     const colRef = collection(userDocRef, name)
//     flashcards.forEach((flashcard) => {
//         const cardDocRef = doc(colRef)
//         batch.set(cardDocRef, flashcard)
//     })

//     await batch.commit()
//     handleClose()
//     router.push('/flashcards')
// }

// return (
//     <Container maxWidth='md'>
//         <Box sx={{mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
//             <Typography variant='h4'>Generate Flashcards</Typography>
//             <Paper sx={{p: 4, width: '100%'}}>
//                 <TextField value={text} onChange={(e) => setText(e.target.value)} label='Enter text' fullWidth multiline rows={4} variant='outlined' sx={{mb: 2,}}/>
//                 <Button variant='contained' color='primary' onClick={handleSubmit} fullWidth>Submit</Button>
//             </Paper>
//         </Box>

//         {flashcards.length > 0 && (
//             <Box sx={{ mt: 4 }}>
//                 <Typography variant='h5'>Flashcards Preview</Typography>
//                 <Grid container spacing={3}>
//                     {flashcards.map((flashcard, index) => (
//                         <Grid item xs={12} sm={6} md={4} key={index}>
//                             <Card>
//                                 <CardActionArea onClick={() => {handleCardClick(index)}}>
//                                     <CardContent>
//                                         <Box sx={{
//                                             perspective: '1000px',
//                                             '& > div': {
//                                                 transition: 'transform 0.6s',
//                                                 transformStyle: 'perserve-3d',
//                                                 position: 'relative',
//                                                 width: '100%',
//                                                 height: '200px',
//                                                 boxShadow: '0 4px 8px 0 rgba(0,0,0, 0.2)',
//                                                 transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
//                                             },
//                                             '& > div > div': {
//                                                 transition: 'absolute',
//                                                 width: '100%',
//                                                 height: '100%',
//                                                 backfaceVisibility: 'hidden',
//                                                 display: 'flex',
//                                                 justifyContent: 'center',
//                                                 alignItems: 'center',
//                                                 padding: 2,
//                                                 boxSizing: 'border-box',
//                                             },
//                                             '& > div > div:nth-of-type(2)': {
//                                                 transform: 'rotateY(180deg)',
//                                             },
//                                         }}><div>
//                                             <div>
//                                                 <Typography variant='h5' component='div'>
//                                                     {flashcard.front}
//                                                 </Typography>
//                                             </div>
//                                             <div>
//                                                 <Typography variant='h5' component='div'>
//                                                     {flashcard.back}
//                                                 </Typography>
//                                             </div>
//                                         </div></Box>
//                                     </CardContent>
//                                 </CardActionArea>
//                             </Card>
//                         </Grid>
//                     ))}
//                 </Grid>
//                 <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center'}}>
//                     <Button variant='contained' color='secondary' onClick={handleOpen}>
//                         Save
//                     </Button>
//                 </Box>
//             </Box>
//         )}

//         <Dialog open={open} onClose={handleClose}>
//             <DialogTitle>Save Flashcards</DialogTitle>
//             <DialogContent>
//                 <DialogContentText>Please enter a name for your flashcards collection</DialogContentText>
//                 <TextField autoFocus margin='dense' label='collection Name' type='text' fullWidth value={name} onChange={(e) => setName(e.target.value)} variant='outlined'/>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={handleClose}>Cancel</Button>
//                 <Button onClick={saveFlashcards}>Save</Button>
//             </DialogActions>
//         </Dialog>
//     </Container>
// )