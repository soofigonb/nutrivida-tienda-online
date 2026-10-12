import ArticuloBlog from '../components/ArticuloBlog.jsx'
import blogs from '../data/blogs.js'

function BlogDetalle2() {
  const blog = blogs.find((articulo) => articulo.id === 2)

  return <ArticuloBlog blog={blog} />
}

export default BlogDetalle2