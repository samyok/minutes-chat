import Head from 'next/head'
import Link from 'next/link';
import styles from '../styles/Home.module.scss'

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Minutes | a smaller version of hours</title>
                <meta name="description" content="Hours"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <h1>Minutes</h1>
                <p>Like Hours. But smaller. And just a chat room.</p>

                <Link href={'/session/'}>
                    <a className={[styles.btn, styles.primary].join(" ")}>
                        Start Session
                    </a>
                </Link>
            </main>
        </div>
    )
}
