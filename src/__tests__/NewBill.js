import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"

/////////////// TU container/newBill ////////////////

describe("Given I am connected as an employee", () => {
  describe("When I am on New Bills Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const html = NewBillUI({ data: []})
      document.body.innerHTML = html
      const iconActive = screen.getByTestId("icon-mail")
      expect(iconActive.classList.contains("active-icon")).toBeTruthy
    })
  })

  //handleChangeFile
  describe("When I fill input with good extension file", () => {
    test("Then the file should be upload", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file");
      const mockFunction = jest.fn(newBill.handleChangeFile)

      fileInput.addEventListener('change', mockFunction)
      fireEvent.change(fileInput, {
        target: {
          files: [new File([''], 'billFake.jpg', { type: 'image/jpg' })],
        },
      })
      expect(mockFunction).toHaveBeenCalled()
      const btnSendBill = document.getElementById('btn-send-bill')
      expect(btnSendBill.disabled).not.toBeTruthy()
    })
  })

  // handleChangeFile
  describe("When I fill input with wrong extension file", () => {
    test("Then the file should not be upload", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const fileInput = screen.getByTestId("file");
      const mockFunction = jest.fn(newBill.handleChangeFile)
      fileInput.addEventListener('change', mockFunction)
      fireEvent.change(fileInput, {
        target: {
          files: [new File([''], 'billFake.gif', { type: 'image/gif' })],
        },
      })
      expect(mockFunction).toHaveBeenCalled()
      const btnSendBill = document.getElementById('btn-send-bill')
      expect(btnSendBill.disabled).toBeTruthy()
      expect(alert).toBeTruthy()
    })
  })

  // handleSubmit
  describe("When I click on submit button", () => {
    test("Then the function handleSubmit should be called", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        email: 'test@test.com'
      }))

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const form = screen.getByTestId("form-new-bill");
      const mockFunction = jest.fn(newBill.handleSubmit)

      form.addEventListener('submit', mockFunction)
      fireEvent.submit(form)

      expect(mockFunction).toHaveBeenCalled()
    })
  })
})


/////////////// test d'intégration POST ////////////////

describe("Given I am a user connected as Employee", () => {
  describe("When I fill new bill form", () => {
    test("Fetches bill ID from mock API post", async() => {
      const dataBill = {
        email:  'a@a',
        type: 'Restaurants et bars',
        name:  '',
        amount: 30,
        date:  '2021-03-14',
        vat: '',
        pct: 20,
        commentary: '',
        fileUrl: '',
        fileName: 'billFake.png',
      }
      const postSpy = jest.spyOn(firebase, 'post')
      const postBill = await firebase.post(dataBill)

      //mock de la fonction POST exécuté 1 fois
      expect(postSpy).toHaveBeenCalledTimes(1)
      //mock de la fonction POST retourné avec succé
      expect(postSpy).toReturn()
      //l'ID est présent dans le POST
      expect(postBill.id).toMatch("47qAXb6fIm2zOKkLzMro")
      //la bills posté est présente dans la table de bills 
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data[0].id).toBe(postBill.id)
    })
  })
  describe("When I click on submit button", () => {
    test("Then the function handleSubmit should be called", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const form = screen.getByTestId("form-new-bill");
      const mockFunction = jest.fn(newBill.handleSubmit)

      form.addEventListener('submit', mockFunction)
      fireEvent.submit(form)

    expect(mockFunction).toHaveBeenCalled()
    })
  })
})
