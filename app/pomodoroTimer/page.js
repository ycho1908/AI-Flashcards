'use client'

import Head from 'next/head';
import PomodoroTimer from '../components/pomodoro';
import { Container, CssBaseline } from '@mui/material';

export default function Home() {
    return (
        <Container maxWidth='sm'>
            <Head>
                <title>Pomodoro Timer</title>
                <meta name="description" content="Pomodoro Timer built with Next.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <CssBaseline />
            <main>
                <PomodoroTimer />
            </main>
        </Container>
    );
}
