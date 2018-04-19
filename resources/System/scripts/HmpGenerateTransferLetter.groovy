import com.egis.data.party.Group
import com.egis.data.party.User
import com.egis.DocumentModel
import com.egis.utils.DateUtils
import com.egis.Repository
import com.egis.utils.ValidationException
import com.egis.utils.ValidationUtils
import com.egis.Session
import com.egis.kernel.Kernel
import com.egis.utils.Handler
import com.egis.data.Form
import com.egis.kernel.db.DbManager

DocumentModel doc = doc
def values = doc.signature().getSavedValues()
Repository repo = Kernel.get(Repository.class)

DbManager db = Kernel.get(DbManager.class)
Form form = db.resolve(Form.class, 'Transfer Letter Business Requirements')

def groupName = 'HCP'
Group group = db.resolve(Group.class, groupName)
ValidationUtils.notNull(group, "${groupName} group does not exist")

def users = []
group.users.each { users << it }
if (users.size() < 1) {
    throw new ValidationException("There are no users in the ${groupName} group")
}
Collections.shuffle(users)
User user = users[0]

repo.runAsSystem({ Session session ->
    DocumentModel model = doc.session.spawnForm(form)
    Map formValues = [
            'name'    : values.employee_name,
            'employee_sap_no'  :values.employee_sap_no,
            'designation'	:values.designation,
            'center'        :values.center,
            'employee_name'	:values.employee_name,
            'grade'			:values.grade,
            'approver_label'		:values.approver_label
    ]
    model.metadata().set(formValues)
    model.signature().setDefaultValues(formValues)
    model.signature().assignRole("_hcp_", user.name);
    model.workflow().set("_hcp_", user.name);
    model.allocate('TransferLetterBusinessRequirements')

} as Handler<Session>)
