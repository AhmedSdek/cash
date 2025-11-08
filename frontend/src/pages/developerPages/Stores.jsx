import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTenants } from "../../store/tenantSlice";
import { Button, Container, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import EditStore from "../../components/Edit/EditStore";

export default function Stores() {
  const dispatch = useDispatch();
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newName, setNewName] = useState("");

  const { tenants, loading, error } = useSelector((state) => state.tenants);
  const token = localStorage.getItem("token");

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  const handleEdit = useCallback((store) => {
    setSelectedStore(store);
    setNewName(store.name);
    setOpenEdit(true);
  }, []);

  const handleToggleActive = useCallback(
    (store) => {
      Swal.fire({
        title: `هل أنت متأكد من ${store.isActive ? "حظر" : "فتح"} هذا المطعم؟`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم",
        cancelButtonText: "إلغاء",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const newStatus = !store.isActive;
            const res = await fetch(
              `http://localhost:4000/api/tenants/${store.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: newStatus }),
              }
            );
            const data = await res.json();
            if (res.ok) {
              Swal.fire("تم!", "تم تحديث حالة المطعم بنجاح", "success");
              dispatch(fetchTenants());
            } else {
              Swal.fire("خطأ!", data.message || "حدث خطأ", "error");
            }
          } catch (err) {
            console.error(err);
            Swal.fire("خطأ!", "حدث خطأ في الاتصال بالسيرفر", "error");
          }
        }
      });
    },
    [dispatch, token]
  );

  const handleDelete = useCallback((storeId) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تستطيع التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("تم!", "تم حذف العنصر بنجاح.", "success");
      }
    });
  }, []);

  const handleSaveEdit = useCallback(
    async (id, newNameValue) => {
      try {
        const res = await fetch(`http://localhost:4000/api/tenants/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newNameValue }),
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("تم!", "تم تعديل اسم المطعم بنجاح", "success");
          dispatch(fetchTenants());
        } else {
          Swal.fire("خطأ!", data.message || "حدث خطأ", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("خطأ!", "حدث خطأ في الاتصال بالسيرفر", "error");
      }
    },
    [dispatch, token]
  );

  const rows = useMemo(
    () =>
      tenants.map((tenant) => ({
        id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        isActive: tenant.isActive ? "Open" : "Block",
        createdAt: new Date(tenant.createdAt).toLocaleString(),
      })),
    [tenants]
  );

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Store", flex: 1 },
      { field: "email", headerName: "Admin Mail", flex: 1 },
      {
        field: "isActive",
        headerName: "Is Active",
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            variant="contained"
            color={params.row.isActive === "Open" ? "error" : "success"}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive({
                id: params.row.id,
                isActive: params.row.isActive === "Open",
              });
            }}
          >
            {params.row.isActive === "Open" ? "Block" : "Unblock"}
          </Button>
        ),
      },
      { field: "createdAt", headerName: "Created At", width: 180 },
      {
        field: "actions",
        headerName: "Actions",
        width: 300,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row);
              }}
            >
              Edit
            </Button>
            {/* <Button
              variant="contained"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id);
              }}
            >
              Delete
            </Button> */}
          </>
        ),
      },
    ],
    [handleEdit, handleToggleActive, handleDelete]
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Container>
        <h1>All Stores</h1>
        <Paper sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            checkboxSelection
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
            }}
          />
        </Paper>
      </Container>

      <EditStore
        openEdit={openEdit}
        selectedStore={selectedStore}
        setOpenEdit={setOpenEdit}
        newName={newName}
        setNewName={setNewName}
        onSave={handleSaveEdit}
      />
    </>
  );
}
