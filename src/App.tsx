import {FormEvent, useState} from 'react'

const categories = ['FASHION', 'TECHNOLOGY', 'SCIENCE', 'TRAVEL', 'SPORTS', 'FOOD'];

interface Filters {
    title: string
    author: string
    category: (typeof categories)
    min_date: string
    max_date: string
}

interface FetchResponse {
    total: number
    contents: {
        title: string
        content: string
        metadata: {
            title: string
            author: string
            publication_date: string
            category: typeof categories[number]
        }
    }[]
}

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <SearchApp/>
        </div>
    )
}

function SearchApp() {
    const limit = 10;
    const [keyword, setKeyword] = useState('')
    const [filters, setFilters] = useState<Filters>({
        title: '',
        author: '',
        category: [],
        min_date: '',
        max_date: ''
    })
    const [fetchResponse, setFetchResponse] = useState<FetchResponse | undefined>()
    const [offset, setOffset] = useState(0)
    const [loading, setLoading] = useState(false)

    const fetchResults = async () => {
        setLoading(true)
        const url = new URL("/hybrid_search", import.meta.env.VITE_SERVER_HOST);
        url.searchParams.append("keyword", keyword);
        url.searchParams.append("offset", offset.toString());
        url.searchParams.append("limit", limit.toString());
        if (filters.title) url.searchParams.append("filters.title", filters.title);
        if (filters.author) url.searchParams.append("filters.author", filters.author);
        if (filters.min_date) url.searchParams.append("filters.min_date", filters.min_date);
        if (filters.max_date) url.searchParams.append("filters.max_date", filters.max_date);
        filters.category.forEach(cat => url.searchParams.append('filters.category', cat));

        try {
            const response = await fetch(url.href);
            const data = await response.json();
            window.scrollTo(0, 0);
            setFetchResponse(data);
        } catch (error) {
            console.error(error);
            window.alert('Search failed. Please see the console for more details.');
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        setOffset(0);
        await fetchResults();
    }

    const handleNavigation = async (direction: "prev" | "next") => {
        if (direction === "prev") {
            setOffset(Math.max(0, offset - limit))
        } else {
            setOffset(offset + limit)
        }
        await fetchResults();
    }

    return <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Magazine Content Search</h1>

        <form onSubmit={handleSearch} className="space-y-6">
            <input
                type="text"
                name="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter search keyword"
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    value={filters.title}
                    onChange={(e) => setFilters({...filters, title: e.target.value})}
                    placeholder="Magazine Title"
                    className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <input
                    type="text"
                    value={filters.author}
                    onChange={(e) => setFilters({...filters, author: e.target.value})}
                    placeholder="Magazine Author"
                    className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <div className="flex flex-col gap-1">
                    <label htmlFor="min_date" className="text-sm">
                        Publication Date (from)
                    </label>
                    <input
                        id="min_date"
                        type="date"
                        value={filters.min_date}
                        onChange={(e) => setFilters({...filters, min_date: e.target.value})}
                        className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="max_date" className="text-sm">
                        Publication Date (to)
                    </label>
                    <input
                        id="max_date"
                        type="date"
                        value={filters.max_date}
                        onChange={(e) => setFilters({...filters, max_date: e.target.value})}
                        className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

            </div>

            <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                    <label className="font-medium">Categories</label>
                    <div className="space-x-2">
                        <button
                            type="button"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                category: categories
                            }))}
                            className="text-sm text-blue-500 hover:text-blue-600"
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                category: []
                            }))}
                            className="text-sm text-blue-500 hover:text-blue-600"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {categories.map(category => (
                        <label key={category} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name={category}
                                checked={filters.category.includes(category)}
                                onChange={() => setFilters(prev => {
                                    const existing = prev.category;
                                    if (existing.includes(category)) {
                                        return {
                                            ...prev,
                                            category: existing.filter(cat => cat !== category)
                                        }
                                    } else {
                                        return {
                                            ...prev,
                                            category: [...existing, category]
                                        }
                                    }
                                })}
                                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span>{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
        </form>

        {fetchResponse && <>
            <div className="mt-8 space-y-4">
                <div>Total results: <span className="font-bold">{fetchResponse.total}</span></div>
                {fetchResponse.contents.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold">{result.title}</h3>
                        <p className="mt-2 text-gray-600 whitespace-pre-wrap">{result.content}</p>
                        <div className="flex gap-2 mt-4">
                            <div className="text-[0.6rem] rounded-lg bg-blue-300 text-yellow-200 px-2 py-1">
                                {result.metadata.category}
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="font-bold">Magazine:</span> {result.metadata.title}
                                &nbsp;| <span className="font-bold">Author:</span> {result.metadata.author}
                                &nbsp;| <span
                                className="font-bold">Published:</span> {result.metadata.publication_date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-center gap-4">
            <button
                    onClick={() => handleNavigation("prev")}
                    disabled={offset === 0 || loading}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                >
                    Previous
                </button>
                <button
                    onClick={() => handleNavigation("next")}
                    disabled={fetchResponse.total <= offset + limit || loading}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                >
                    Next
                </button>
            </div>
        </>}
    </div>
}
