
import com.egis.DocumentModel
import com.egis.utils.DateUtils
import com.egis.Repository
import com.egis.Session
import com.egis.kernel.Kernel
import com.egis.utils.Handler

import com.egis.data.Form
import com.egis.kernel.db.DbManager

DocumentModel doc = doc
def values = doc.signature().getSavedValues()
Repository repo = Kernel.get(Repository.class)

DbManager db = Kernel.get(DbManager.class)
Form form = db.resolve(Form.class, 'Request Exit Clearance')

repo.runAsSystem({ Session session ->
    DocumentModel model = doc.session.spawnForm(form)
    Map formValues = [
            'employee_name'    : values.employee_name,
            'employee_sap_no'  : values.sap_no,
            'terminated_due_to': values.motivation,
            'date'             :values.created_date,
            'depot'	       :values.region
    ]
    model.metadata().set(formValues)
    model.signature().setDefaultValues(formValues)
    model.signature().assignRole("Compensation Officer", "Compensation Officer");
    model.workflow().set("Compensation Officer", "Compensation Officer");
    model.allocate('RequestExitClearance')

} as Handler<Session>)
