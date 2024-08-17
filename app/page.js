'use client'

import Image from "next/image";
import getStripe from "@/utils/getStripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from "@mui/material";
import Head from "next/head";

export default function Home() {
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_session', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
    })

    const checkoutSessionJson = await checkoutSession.json()

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })

    if (error) {
      console.warn(error.message)
    }
  }


  return (
    <>
      <Head>
        <title>Flashcard</title>
        <meta name='description' content='create flashcard from your text'/>
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>Flashcard Saas</Typography>
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
          <Typography variant='h2' gutterBottom>Welcome to Flashcard</Typography>
          <Typography variant='h5' gutterBottom>The easiest way to make flashcards from your text</Typography>
          <Button variant='contained' color='primary' sx={{ mt: 2 }}>Get Started</Button>
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
            <Typography variant='h6' gutterBottom>Smart Flashcards</Typography>
            <Typography>Simply input your text and let our software do the rest.</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='h6' gutterBottom>Accessible Anywhere</Typography>
            <Typography>Simply input your text and let our software do the rest.</Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{my: 6, textAlign: 'center'}}>
        <Typography variant='h4' gutterBottom>Pricing</Typography>
        <Grid container justifyContent="center" spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{p: 3, border:'1px solid', borderColor: 'grey.300', borderRadius: 2,}}>
              <Typography variant='h5' gutterBottom>Basic</Typography>
              <Typography variant='h6' gutterBottom>$5 / month</Typography>
              <Typography>Access to basic flashcard features and limited storage.</Typography>
              <Button variant='contained' color='primary' mt='2'>Choose basic</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{p: 3, border:'1px solid', borderColor: 'grey.300', borderRadius: 2,}}>
              <Typography variant='h5' gutterBottom>Pro</Typography>
              <Typography variant='h6' gutterBottom>$10 / month</Typography>
              <Typography>Access to unlimited flashcards and unlimited storage.</Typography>
              <Button variant='contained' color='primary' mt='2' onClick={handleSubmit}>Choose Pro</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}