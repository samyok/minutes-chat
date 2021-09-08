import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Room.module.scss';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

export default function Home({ websocketURL }) {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [websocket, setWebsocket] = useState(null);
    const [people, setPeople] = useState([]);
    const [messages, setMessages] = useState([]);
    const router = useRouter();
    const { sessionId } = router.query;
    const [messageInput, setMessageInput] = useState('');
    const bottomOfChat = useRef(null);

    useEffect(() => {
        if (!sessionId) return;

        // make sure we have name, otherwise send send to index to set name
        if (localStorage.getItem('name')) {
            setName(localStorage.getItem('name'));
        } else {
            location.href = `/session/?join=${sessionId}`;
        }
    }, [sessionId]);

    useEffect(() => {
        if (websocketURL && name) {
            let ws = io(websocketURL, {
                auth: {
                    name,
                    room: sessionId,
                },
            });

            setWebsocket(ws);

            ws.on('connected', () => {
                setLoading(false);
            });

            /* attach ws handlers here: */

            ws.on('join', ({ person, newPeople }) => {
                console.log('joined:', person, newPeople);
                setPeople(newPeople);
                setMessages(pv => [
                    ...pv,
                    {
                        system: true,
                        message: `${person?.name} has connected`,
                    },
                ]);
            });

            ws.on('leave', ({ person, newPeople }) => {
                console.log('left:', person);
                setPeople(newPeople);
                setMessages(pv => [
                    ...pv,
                    {
                        system: true,
                        message: `${person?.name} has left :(`,
                    },
                ]);
            });


            ws.on('chat', (data) => {
                console.log('chat:', data);
                setMessages(pv => [
                    ...pv,
                    data,
                ]);
            });

            return () => ws.disconnect();
        }
    }, [name, sessionId, websocketURL]);

    useEffect(() => {
        bottomOfChat.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);


    const sendChatMessage = useCallback((message) => {
        if (websocket && message.length) {
            websocket.emit('chat', {
                author: name,
                message,
            });
            setMessageInput('');
        }
    }, [name, websocket]);
    let pageURL = typeof window === 'object' ? window.location.href : router.asPath;
    return (
        <div>
            <Head>
                <title>Minutes | a smaller version of hours</title>
                <meta name='description' content='Hours' />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main className={styles.main}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        Room {sessionId}
                    </div>
                    <div className={styles.cardBody}>
                        Current Users ({people.length}):
                        <ul>
                            {people.map((person, index) => <li key={JSON.stringify(person) + index}>{person.name}</li>)}
                        </ul>
                    </div>
                    <div className={[styles.cardFooter, styles.inputContainer].join(' ')}>
                        <input value={pageURL}
                               className={[styles.input, styles.inputLeft].join(' ')}
                               type='text' disabled />
                        <button
                            className={[styles.btn, styles.primary, styles.inputRight].join(' ')}
                            onClick={() => navigator.clipboard.writeText(pageURL)}
                        >
                            <Image src={'/copy.svg'} width={20} height={20} alt={'copy icon'} />
                        </button>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        Chat
                    </div>
                    <div className={[styles.cardBody, styles.chat].join(' ')}>
                        {messages.map((msg, index) => {
                            if (msg.system)
                                return <p key={'message-' + index} className={styles.systemMessage}>{msg.message}</p>;
                            else
                                return <p key={'message-' + index} title={msg.time}><span
                                    className={styles.chatAuthor}>{msg.author}</span>: {msg.message}</p>;

                        })}
                        <div ref={bottomOfChat} />
                    </div>
                    <div className={[styles.cardFooter, styles.inputContainer].join(' ')}>
                        <input
                            className={[styles.input, styles.inputLeft].join(' ')}
                            type='text'
                            value={messageInput}
                            onChange={e => setMessageInput(e.target.value)}
                            onKeyPress={e => {
                                if (e.key === 'Enter') sendChatMessage(messageInput);
                            }}
                        />
                        <button
                            className={[styles.btn, styles.primary, styles.inputRight].join(' ')}
                            onClick={() => sendChatMessage(messageInput)}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export function getStaticProps() {
    return { props: { websocketURL: process.env.WS_URL } };
}

export function getStaticPaths() {
    // don't pre-render anything at build time, just render when a new page is requested
    return { paths: [], fallback: true };
}
