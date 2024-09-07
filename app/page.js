'use client'

import Image from "next/image";
import getStripe from "@/utils/getStripe";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Home() {
  const {isSignedIn} = useUser();
  const router = useRouter();

  // // FOR purchasing options
  // const handleSubmit = async () => {
  //   const checkoutSession = await fetch('/api/checkout_session', {
  //     method: 'POST',
  //     headers: {
  //       origin: 'http://localhost:3000',
  //     },
  //   })

  //   const checkoutSessionJson = await checkoutSession.json()

  //   if (checkoutSession.statusCode === 500) {
  //     console.error(checkoutSession.message)
  //     return
  //   }

  //   const stripe = await getStripe()
  //   const {error} = await stripe.redirectToCheckout({
  //     sessionId: checkoutSessionJson.id,
  //   })

  //   if (error) {
  //     console.warn(error.message)
  //   }
  // }


  return (
    <>
      <Head>
        <title>StudySphere</title>
        <meta name='description' content='create flashcard from your text'/>
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>StudySphere</Typography>
          <SignedOut>
            <Button color='inherit' href='/sign-in'>Login</Button>
            <Button color='inherit' href='/sign-up'>SignUp</Button>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center'}}>
        <Box>
          <Typography variant='h2' gutterBottom>Welcome to StudySphere</Typography>
          <Typography variant='h5' gutterBottom>The easiest way to improve your education</Typography>
          {
            !isSignedIn && 
            <Button variant='contained' color='primary' sx={{ mt: 2 }} 
            onClick={() => router.push('/sign-in')}>Get Started</Button>
          }
        </Box>
      </Container>
      <Box sx = {{my: 6, mx: 3}}>
        <Typography variant='h4' gutterBottom>Features</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Easy Text Input</Typography>
            <Typography>Simply input your text and let our software do the rest.</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Smart Support</Typography>
            <Typography>Get access to flashcards and note taking guidance.</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Accessible</Typography>
            <Typography>Completely free to support every students.</Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{my: 6, textAlign: 'center'}}>
        <Typography variant='h4' gutterBottom>Options</Typography>
        <Grid container justifyContent="center" spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{p: 3, border:'1px solid', borderColor: 'grey.300', borderRadius: 2,}}>
              <Typography variant='h5' gutterBottom>Flashcards</Typography>
              <Typography variant='h6' gutterBottom>FREE after signing up</Typography>
              <Typography>Generate flashcards with AI to start learning about a topic.</Typography>
              <br/>
              {
                // isSignedIn && ( <Button variant='contained' color='primary' mt='2' onClick={handleSubmit}>Choose Flashcards</Button> )
                isSignedIn && ( <Button variant='contained' color='primary' mt='2' onClick={() => router.push('/generate')}>Choose Flashcards</Button> )
              }
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{p: 3, border:'1px solid', borderColor: 'grey.300', borderRadius: 2,}}>
              <Typography variant='h5' gutterBottom>Pomodoro Timer</Typography>
              <Typography variant='h6' gutterBottom>FREE after signing up</Typography>
              <Typography>Get guidance in time management.</Typography>
              <br/>
              {
                // isSignedIn && ( <Button variant='contained' color='primary' mt='2' onClick={handleSubmit}>Choose Note Taking</Button> )
                isSignedIn && ( <Button variant='contained' color='primary' mt='2' onClick={() => router.push('/pomodoroTimer')}>Choose Pomodoro Timer</Button> )
              }
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}