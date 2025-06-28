import MiniSearch from 'minisearch'
import theses from '$lib/data/theses.json'
import type { Thesis } from '$lib/types'

const miniSearch = new MiniSearch<Thesis>({
    fields: ['title'],
    storeFields: ['title', 'id', 'author_name', 'author_id', 'tags', 'description', 'supervisor', 'tags']
})

miniSearch.addAll(theses)

export { miniSearch }
