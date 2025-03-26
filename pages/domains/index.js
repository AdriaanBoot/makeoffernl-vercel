import fs from "fs";
import path from "path";
import Link from "next/link";

export default function DomainsPage({ domains }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Available Domains for Sale</h1>
      <p>Browse the list of available domains and place your offer.</p>
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {domains.map((domain) => (
          <li key={domain.domain} style={{ marginBottom: "15px" }}>
            {/* Correct gebruik van <Link> zonder <a> */}
            <Link href={`/domains/${domain.domain.toLowerCase()}`}>
              {domain.domain}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "domains_data.json");
  const jsonData = fs.readFileSync(filePath, "utf8");
  const domains = JSON.parse(jsonData);

  return {
    props: {
      domains,
    },
  };
}
