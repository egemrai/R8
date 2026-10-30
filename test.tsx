arama yaaprken useTransition kullanıp inputun öncelikli şekilde değişmesini sağlıyoruz.
arama düşük öncelikli, userın yazı yazması yüksek öncelik.

    const[query, setQuery] = useState("");
const [results, setResults] = useState([]);

<input
    value={query}
    onChange={(e) => {
        setQuery(e.target.value);

        startTransition(() => {
            setResults(search(e.target.value));
        });
    }}
/>