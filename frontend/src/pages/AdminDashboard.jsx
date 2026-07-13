  async function loadCategories() {
    try { setCategories(await getCategories()) } catch { showMsg('Error al cargar categorías', true) }
  }

  async function loadProducts() {
    setLoading(true)
    try { setProducts(await getProducts()) } catch { setError('Error al cargar productos') }
    finally { setLoading(false) }
  }

  async function loadUsers(search = '') {
    setUsersLoading(true)
    try { setUsers(await getUsers(search)) } catch { showMsg('Error al cargar usuarios', true) }
    finally { setUsersLoading(false) }
  }