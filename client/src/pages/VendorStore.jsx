import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";

const emptyForm = {
  storeName: "",
  description: "",
  address: "",
  categories: [],
  contactNumber: "",
};

const VendorStore = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasStore, setHasStore] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const catRes = await api.get("/categories");
      setCategories(catRes.data.data || []);

      try {
        const storeRes = await api.get("/vendor/store");
        const store = storeRes.data.data;

        setForm({
          storeName: store.storeName || "",
          description: store.description || "",
          address: store.address || "",
          categories:
            store.categories?.map((category) => category._id) || [],
          contactNumber: store.contactNumber || "",
        });

        setHasStore(true);
      } catch (storeError) {
        if (storeError.response?.status === 404) {
          setHasStore(false);
          setForm(emptyForm);
        } else {
          throw storeError;
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load store data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (categoryId) => {
    setForm((previousForm) => {
      const alreadySelected =
        previousForm.categories.includes(categoryId);

      return {
        ...previousForm,
        categories: alreadySelected
          ? previousForm.categories.filter(
              (id) => id !== categoryId
            )
          : [...previousForm.categories, categoryId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.categories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setSaving(true);

    try {
      if (hasStore) {
        await api.put("/vendor/store", form);
        toast.success("Store updated successfully");
      } else {
        await api.post("/vendor/store", form);
        toast.success("Store created successfully");
      }

      await load();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save store"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">
        {hasStore ? "My Store" : "Create Your Store"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="text-sm font-medium">
            Store Name
          </label>

          <input
            name="storeName"
            required
            value={form.storeName}
            onChange={handleChange}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Address
          </label>

          <input
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Store Categories
          </label>

          <p className="text-xs text-gray-400 mt-1 mb-3">
            You can select multiple categories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-lg p-4">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">
                No categories available.
              </p>
            ) : (
              categories.map((category) => (
                <label
                  key={category._id}
                  className="flex items-center gap-2 cursor-pointer border rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form.categories.includes(
                      category._id
                    )}
                    onChange={() =>
                      handleCategoryChange(category._id)
                    }
                    className="w-4 h-4"
                  />

                  <span className="text-sm">
                    {category.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Contact Number
          </label>

          <input
            name="contactNumber"
            required
            value={form.contactNumber}
            onChange={handleChange}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : hasStore
            ? "Update Store"
            : "Create Store"}
        </button>
      </form>
    </div>
  );
};

export default VendorStore;