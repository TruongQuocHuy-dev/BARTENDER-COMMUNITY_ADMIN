import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/client'

export default function CategoryDetail(){
  const { id } = useParams()
  const [data, setData] = useState({ category: null, recipes: [] })

  useEffect(()=>{ load() }, [id])
  const load = async ()=>{
    try{
      const res = await api.get('/categories/'+id)
      setData(res)
    }catch(e){ console.error(e) }
  }

  if(!data.category) return <div>Loading...</div>

  const { category, recipes } = data

  return (
    <div>
      <h1>{category.name}</h1>
      <div className="card">
        <div><strong>ID:</strong> {category.id}</div>
        <div><strong>Count:</strong> {category.count}</div>
        <div><strong>Created:</strong> {new Date(category.createdAt).toLocaleString()}</div>
        <div><strong>Updated:</strong> {new Date(category.updatedAt).toLocaleString()}</div>
      </div>

      <h2 style={{marginTop:16}}>Recipes in this category</h2>
      <div className="card">
        <table className="table">
          <thead><tr><th>Title</th><th>Author</th></tr></thead>
          <tbody>
            {recipes.map(r => (
              <tr key={r._id}>
                <td><Link to={`/recipes`}>{r.name}</Link></td>
                <td>{r.author?.displayName || r.author?.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
