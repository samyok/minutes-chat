import Head from 'next/head';
import styles from '../../styles/RoomModal.module.scss';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    let pageURL = typeof window === 'object' ? window.location.href : router.asPath;

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [room, setRoom] = useState(null);

    useEffect(() => {
        let url = new URL(pageURL);
        if (url.searchParams.get('join')) {
            setRoom(url.searchParams.get('join'));
        }
    }, [pageURL]);
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
                        {room ? `Join room ${room}` : 'Create a Minutes room'}
                    </div>
                    <div className={styles.cardBody}>
                        {!room && <p>You&apos;ll be given a short link to invite other people to your room!</p>}
                        <p>We just need your name:</p>
                        <input
                            onChange={ev => setName(ev.currentTarget.value)}
                            value={name}
                            className={styles.input}
                            type='text'
                            placeholder={'John Doe'}
                        />
                    </div>
                    <div className={styles.cardFooter}>
                        <button
                            className={[styles.btn, styles.primary].join(' ')}
                            onClick={() => {
                                setLoading(true);
                                localStorage.setItem('name', name);
                                if (room) return location.href = `/session/${room}`;

                                fetch('/api/createRoom')
                                    .then(r => r.json())
                                    .then(data => {
                                        location.href = data.href;
                                    })
                                    .catch(a => alert(a))
                                    .finally(() => setLoading(false));
                            }}
                            disabled={loading || !name.length}>
                            {loading ? 'Loading...' : (room ? 'Join Room' : 'Create Room')}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
