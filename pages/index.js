import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default function HomePage({ domains }) {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h1>Welkom bij MakeOffer.nl</h1>
      <h2>Bied op onze domeinnamen</h2>
      <ul>
        {domains.map((domain, index) => (
          <li key={index}>
            <Link href={`/domeinen/${domain.domain.toLowerCase()}`} prefetch={false}>
              {domain.domain}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  // Haal de domeinnamen op uit het JSON-bestand
  const filePath = path.join(process.cwd(), 'data', 'domeinen.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const allDomains = JSON.parse(jsonData);

  // Geef de domeinnamen door als props aan de pagina
  return {
    props: {
      domains: allDomains,
    },
    revalidate: 18000, // Pagina wordt elke 18000 seconden opnieuw opgebouwd, pas aan op basis van je behoefte
  };
}
