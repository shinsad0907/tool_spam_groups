document.addEventListener("DOMContentLoaded", () => {
  async function loadAccountGroups(selectedGroup = "all") {
    const filePath = path.join(__dirname, "data", "sweep_page.json");

    try {
      if (!fs.existsSync(filePath)) {
        // Khởi tạo trạng thái rỗng nếu file không tồn tại
        // initializeEmptyState();
        console.warn("File không tồn tại, khởi tạo trạng thái mặc định.");
        return;
      }

      const fileData = fs.readFileSync(filePath, "utf-8");
      let groups = JSON.parse(fileData);

      // Kiểm tra dữ liệu trong file JSON
      if (!Array.isArray(groups)) {
        console.error("Dữ liệu trong file không hợp lệ, phải là một mảng.");
        // initializeEmptyState();
        return;
      }

      console.log("Danh sách nhóm tài khoản:", groups);

      // Cập nhật danh sách nhóm trong select element
      updateGroupSelect(groups);

      let allAccounts = [];
      if (selectedGroup === "all") {
        // Lấy tất cả tài khoản từ tất cả nhóm
        allAccounts = groups.flatMap((group) => group.data || []);
      } else {
        // Lọc các tài khoản theo nhóm đã chọn
        const selectedGroupData = groups.find(
          (group) => group.name_groups === selectedGroup
        );
        if (selectedGroupData) {
          allAccounts = selectedGroupData.data || [];
        }
      }

      // Gọi các hàm render giao diện nếu cần
      renderAccountsTable(allAccounts);
      // updateStats(allAccounts);
    } catch (error) {
      console.error("Error loading groups:", error);
      // initializeEmptyState();
    }
  }
  function renderAccountsTable(accounts) {
    let id = 0;
    const resultsTbody = document.getElementById("results-tbody-manager-pages");
    resultsTbody.innerHTML = "";

    if (!accounts || accounts.length === 0) {
      resultsTbody.innerHTML = `        
          <tr>
            <td colspan="6" style="text-align: center; padding: 20px;">
              Chưa có tài khoản nào. Vui lòng thêm tài khoản mới.
            </td>
          </tr>
        `;
      return;
    }

    accounts.forEach((account) => {
      id++;

      // Tạo một dòng mới để hiển thị tài khoản
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td><input type="checkbox" class="checkbox" /></td>
          <td>${id}</td>
          <td>${account.name_account || ""}</td>
          <td>${account.uid_account || ""}</td>
          <td title="${account.cookie_account || ""}">
        ${
          account.cookie_account && account.cookie_account.length > 20
            ? account.cookie_account.slice(0, 20) + "..."
            : account.cookie_account || ""
        }
        </td>
          <td>${account.name_page || ""}</td>
          <td>${account.uid_page || ""}</td>
          <td title="${account.cookie_page || ""}">
        ${
          account.cookie_page && account.cookie_page.length > 20
            ? account.cookie_page.slice(0, 20) + "..."
            : account.cookie_page || ""
        }
        </td>
          <td>${account.url_page || ""}</td>
          <td><span class="${
            account.status.toLowerCase() === "live" ? "status-live" : ""
          }">${account.status}</span></td>
        `;
      resultsTbody.appendChild(tr);
    });
  }

  function updateGroupSelect(groups) {
    const selects = [
      document.getElementById("managePagesSelect"),
      // Add other select elements here if necessary
      // document.getElementById("scanGroupsSelect"),
    ];

    selects.forEach((select) => {
      if (!select) return;

      // Lưu giá trị đang được chọn
      const currentValue = select.value;

      // Xóa các tùy chọn hiện tại
      select.innerHTML = "";

      // Thêm tùy chọn mặc định
      const defaultText =
        select.id === "managePagesSelect"
          ? "Tất cả tài khoản"
          : "Chọn danh mục tài khoản quét";
      select.appendChild(new Option(defaultText, "all"));

      // Thêm các nhóm từ danh sách `groups`
      groups.forEach((group) => {
        if (group && group.name_groups) {
          const option = new Option(group.name_groups, group.name_groups);
          select.appendChild(option);
        }
      });

      // Khôi phục giá trị đã chọn nếu giá trị đó vẫn tồn tại
      const optionExists = Array.from(select.options).some(
        (option) => option.value === currentValue
      );
      if (optionExists) {
        select.value = currentValue;
      } else {
        select.value = "all"; // Mặc định về "all" nếu không tồn tại
      }
    });
  }

  // Thêm sự kiện thay đổi giá trị trên select element
  document
    .getElementById("managePagesSelect")
    .addEventListener("change", function () {
      const selectedGroup = this.value;
      console.log("Nhóm đã chọn:", selectedGroup);
      loadAccountGroups(selectedGroup); // Gọi lại hàm để tải tài khoản theo nhóm đã chọn
    });

  // Tải dữ liệu nhóm và cập nhật giao diện ban đầu
  loadAccountGroups();
});
