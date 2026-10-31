import ArticuloBlog from '../components/ArticuloBlog.jsx'
import blogs from '../data/blogs.js'

function BlogDetalle1() {
  const blog = blogs.find((articulo) => articulo.id === 1)

  return <ArticuloBlog blog={blog} />
}

export default BlogDetalle1