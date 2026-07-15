import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const createEmptyForm = () => ({
  productName: "",
  description: "",
  category: "",
  price: "",
  stockQuantity: "",
  productImage: "",
  returnEligible: false,
});

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(createEmptyForm());
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isEditing = Boolean(editingId);

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:ring-gray-700";

  const load = async () => {
    setLoading(true);

    try {
      const [productsResponse, categoriesResponse] =
        await Promise.all([
          api.get("/vendor/products"),
          api.get("/categories"),
        ]);

      setProducts(productsResponse.data.data || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setForm(createEmptyForm());
    setSelectedImage(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, JPEG, PNG and WEBP images are allowed"
      );
      event.target.value = "";
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      toast.error("Image size must be 5 MB or less");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

  const removeSelectedImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(form.productImage || "");
  };

  const openAddForm = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setForm(createEmptyForm());
    setSelectedImage(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditForm = (product) => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setForm({
      productName: product.productName || "",
      description: product.description || "",
      category: product.category?._id || "",
      price:
        product.price !== undefined
          ? String(product.price)
          : "",
      stockQuantity:
        product.stockQuantity !== undefined
          ? String(product.stockQuantity)
          : "",
      productImage: product.productImage || "",
      returnEligible: Boolean(product.returnEligible),
    });

    setSelectedImage(null);
    setImagePreview(product.productImage || "");
    setEditingId(product._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("productName", form.productName.trim());
    formData.append(
      "description",
      form.description.trim()
    );
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append(
      "stockQuantity",
      form.stockQuantity
    );
    formData.append(
      "returnEligible",
      String(form.returnEligible)
    );

    if (selectedImage) {
      formData.append("productImage", selectedImage);
    } else if (form.productImage) {
      formData.append(
        "productImage",
        form.productImage.trim()
      );
    }

    return formData;
  };

  const validateForm = () => {
    if (!form.productName.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return false;
    }

    if (form.price === "") {
      toast.error("Price is required");
      return false;
    }

    if (Number(form.price) < 0) {
      toast.error("Price cannot be negative");
      return false;
    }

    if (form.stockQuantity === "") {
      toast.error("Stock quantity is required");
      return false;
    }

    if (Number(form.stockQuantity) < 0) {
      toast.error("Stock cannot be negative");
      return false;
    }

    if (
      !isEditing &&
      !selectedImage &&
      !form.productImage.trim()
    ) {
      toast.error(
        "Please choose an image or enter an image URL"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const formData = buildFormData();

      if (editingId) {
        await api.put(
          `/vendor/products/${editingId}`,
          formData
        );

        toast.success("Product updated successfully");
      } else {
        await api.post("/vendor/products", formData);

        toast.success("Product added successfully");
      }

      resetForm();
      await load();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Do you really want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(productId);

    try {
      await api.delete(
        `/vendor/products/${productId}`
      );

      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) => product._id !== productId
        )
      );

      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const previewSource = useMemo(() => {
    return (
      imagePreview ||
      form.productImage ||
      ""
    );
  }, [imagePreview, form.productImage]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            My Products
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add, edit and manage your store products.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="w-fit rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="mb-7 space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {isEditing
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload an image directly or use an image URL.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close product form"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Product Name
                </label>

                <input
                  name="productName"
                  required
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Category
                </label>

                <select
                  name="category"
                  required
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  step="1"
                  required
                  value={form.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Upload Product Image
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="mt-1 block w-full cursor-pointer rounded-lg border border-gray-200 bg-white text-sm text-gray-600 file:mr-4 file:border-0 file:bg-primary-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-white"
                />

                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG or WEBP. Maximum size: 5 MB.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Image URL (optional)
                </label>

                <input
                  name="productImage"
                  value={form.productImage}
                  onChange={(event) => {
                    handleChange(event);

                    if (!selectedImage) {
                      setImagePreview(event.target.value);
                    }
                  }}
                  placeholder="https://example.com/product.jpg"
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-gray-400">
                  Uploaded file will be preferred over this URL.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write product details..."
                  className={inputClass}
                />
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                <input
                  type="checkbox"
                  name="returnEligible"
                  checked={form.returnEligible}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Return Eligible
                </span>
              </label>
            </div>

            <aside>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                Image Preview
              </p>

              <div className="overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                {previewSource ? (
                  <img
                    src={previewSource}
                    alt="Product preview"
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/600x600?text=Invalid+Image";
                    }}
                    className="aspect-square h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center px-6 text-center">
                    <span className="text-5xl">
                      🖼️
                    </span>

                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Select an image to see its preview.
                    </p>
                  </div>
                )}
              </div>

              {selectedImage && (
                <div className="mt-3 rounded-lg border border-gray-200 p-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <p className="truncate font-medium text-gray-700 dark:text-gray-200">
                    {selectedImage.name}
                  </p>

                  <p className="mt-1">
                    {(
                      selectedImage.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>

                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="mt-3 font-medium text-red-500 hover:underline"
                  >
                    Remove selected file
                  </button>
                </div>
              )}
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-gray-800 sm:flex-row">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? isEditing
                  ? "Updating..."
                  : "Uploading & Saving..."
                : isEditing
                  ? "Update Product"
                  : "Save Product"}
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <EmptyState message="You haven't added any products yet." />
      ) : (
        <>
          {/* Mobile and tablet cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {products.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-800 sm:h-auto sm:w-44">
                  <img
                    src={
                      product.productImage ||
                      "https://placehold.co/500x400?text=No+Image"
                    }
                    alt={product.productName}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://placehold.co/500x400?text=No+Image";
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
                    {product.category?.name || "General"}
                  </p>

                  <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {product.productName}
                  </h3>

                  <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Stock: {product.stockQuantity}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(product)
                      }
                      className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:bg-gray-800 dark:text-primary-500"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId === product._id
                      }
                      onClick={() =>
                        handleDelete(product._id)
                      }
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400"
                    >
                      {deletingId === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Return</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t border-gray-200 dark:border-gray-800"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.productImage ||
                              "https://placehold.co/100x100?text=No+Image"
                            }
                            alt={product.productName}
                            onError={(event) => {
                              event.currentTarget.src =
                                "https://placehold.co/100x100?text=No+Image";
                            }}
                            className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                          />

                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-medium text-gray-900 dark:text-white">
                              {product.productName}
                            </p>

                            <p className="mt-1 max-w-[260px] truncate text-xs text-gray-400">
                              {product.description ||
                                "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-gray-500 dark:text-gray-400">
                        {product.category?.name || "-"}
                      </td>

                      <td className="p-4 font-medium text-gray-900 dark:text-white">
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            Number(product.stockQuantity) > 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-500"
                          }
                        >
                          {product.stockQuantity}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            product.returnEligible
                              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {product.returnEligible
                            ? "Eligible"
                            : "Not eligible"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(product)
                            }
                            className="font-medium text-primary-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId === product._id
                            }
                            onClick={() =>
                              handleDelete(product._id)
                            }
                            className="font-medium text-red-500 hover:underline disabled:opacity-50"
                          >
                            {deletingId === product._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorProducts;