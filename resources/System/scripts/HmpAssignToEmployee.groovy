import com.egis.DocumentModel
import com.egis.data.party.User
import com.egis.transnet.sap.Employee
import com.egis.utils.ValidationUtils

User employee = Employee.find(doc.signature().savedValues.employee_sap_no)?.createOrGetUser()
ValidationUtils.notNull(employee, "Cannot find employee with SAP No: " + doc.signature().savedValues.employee_sap_no)
DocumentModel doc = doc;
doc.signature().assignRole("_employee_", employee.name);
doc.workflow().set("_employee_", employee.name);
doc.parties().add(employee)

