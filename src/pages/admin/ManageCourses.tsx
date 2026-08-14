import React, { useState, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import CreateCourseForm from "../../components/forms/CreateCourseForm";
import ViewCourse from "../../components/ViewCourse";
import type { TableColumnProps } from "../../lib/interfaces";
import { FaPlus } from "react-icons/fa6";
import api from "../../helpers/api.tsx";
import { toast } from "sonner";
import { useUser } from "../../context/UserContext";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../utility/ActionCell";


const ManageCourses: React.FC = () => {
  const { token } = useUser();

  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | "delete" | null>(null);

  const itemsPerPage = 10;

  // ================= FETCH =================
  const fetchCourses = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/courses?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = [];
      if (res.data?.courses && Array.isArray(res.data.courses)) {
        data = res.data.courses;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      } else {
        data = res.data?.data || [];
      }

      setCourses(data);
      setTotalPages(res.data.last_page || 1);
      setTotalItems(res.data.total || data.length);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses.");
      toast.error("Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token, currentPage]);

  // ================= CREATE =================
  const handleCreate = async (data: any) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      // Append empty image to satisfy backend requirement
      formData.append("image", "");

      await api.post("/api/courses", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Course created successfully!");
      setIsCreateModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async (data: any) => {
    if (!token || !selectedCourse) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Laravel method spoofing: the API expects POST with _method=PUT
      // for file-upload capable endpoints (see Postman collection).
      formData.append("_method", "PUT");
      formData.append("title", data.title);
      formData.append("description", data.description);
      // Append empty image to satisfy backend requirement
      formData.append("image", "");

      await api.post(`/api/courses/${selectedCourse.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Course updated successfully!");
      setModalType(null);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (course: any) => {
    if (!token || !course?.id) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/courses/${course.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Course deleted successfully.");
      setModalType(null);
      setSelectedCourse(null);
      fetchCourses();
    } catch {
      toast.error("Failed to delete course.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ================= ACTION HANDLERS =================
  const handleView = (id: number) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    setSelectedCourse(course);
    setModalType("view");
  };

  const handleEdit = (id: number) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    setSelectedCourse(course);
    setModalType("edit");
  };

  const handleDeleteClick = (id: number) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;
    setSelectedCourse(course);
    setModalType("delete");
  };

  // ================= TABLE =================
  const columns: TableColumnProps[] = [
    { title: "Course Title", key: "title" },
    // {
    //   title: "Price",
    //   key: "price",
    //   render: (item) => (item.price ? `¥${item.price}` : "-"),
    // },
    // { title: "Language", key: "language" },
    {
      title: "Description",
      key: "description",
      render: (item) => (
        <span className="max-w-xs block truncate" title={item.description}>
          {item.description || "—"}
        </span>
      ),
    },
    {
      title: "Created At",
      key: "created_at",
      render: (item) =>
        item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "-",
    },

    // ================= ACTION CELL =================
    {
      title: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          canView={true}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-tetiary">
          Manage Courses
        </h1>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 h-11.25 flex items-center gap-2 bg-purple text-white rounded-md"
        >
          <FaPlus /> Add Course
        </button>
      </div>

      <ReusableTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* CREATE */}
      {isCreateModalOpen && (
        <Modal onClose={() => setIsCreateModalOpen(false)}>
          <CreateCourseForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* VIEW */}
      {modalType === "view" && selectedCourse && (
        <Modal
          onClose={() => {
            setModalType(null);
            setSelectedCourse(null);
          }}
        >
          <ViewCourse
            course={selectedCourse}
            onClose={() => {
              setModalType(null);
              setSelectedCourse(null);
            }}
          />
        </Modal>
      )}

      {/* EDIT */}
      {modalType === "edit" && selectedCourse && (
        <Modal
          onClose={() => {
            setModalType(null);
            setSelectedCourse(null);
          }}
        >
          <CreateCourseForm
            initialData={selectedCourse}
            onSubmit={handleUpdate}
            onCancel={() => {
              setModalType(null);
              setSelectedCourse(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* DELETE */}
      <ConfirmDialog
        isOpen={modalType === "delete" && selectedCourse !== null}
        title="Confirm Delete"
        message={`Are you sure you want to delete course "${selectedCourse?.title}"?`}
        onConfirm={() => handleDelete(selectedCourse)}
        onCancel={() => {
          setModalType(null);
          setSelectedCourse(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageCourses;