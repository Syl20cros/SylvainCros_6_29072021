import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import NewBillUI from "../views/NewBillUI.js"
import Bills from "../containers/Bills.js"
import { ROUTES } from "../constants/routes.js"
import userEvent from "@testing-library/user-event"
import firebase from "../__mocks__/firebase.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import {formatDate} from "../app/format.js"

/////////////// views/Bills ////////////////

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      const iconActive = screen.getByTestId("icon-window")
      expect(iconActive.classList.contains("active-icon")).toBeTruthy
    })

    test("Then bills should be ordered from earliest to latest", () => {
      // isole les dates
      const datesTable = [];
      bills.forEach((bill) =>{
        datesTable.push(bill.date)
      })
      // Trie les dates
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = datesTable.sort(antiChrono)
      // dates en Fr
      const datesSortedInFrench = [];
      datesSorted.forEach((dateEn) => {
        datesSortedInFrench.push(formatDate(dateEn));
      })
      // tri des dates du fixtures
      const html = BillsUI({ data: bills})
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^([1-9]|[12][0-9]|3[01]) ([a-zé]{3,4}[.]) (\d{2})$/i).map(a => a.innerHTML)
      // comparatif des attendues
      expect(dates).toEqual(datesSortedInFrench)
    })
  })
})

describe("Given an employee enter his email and his password", () => {
  describe("When user validate by push button", () => {
    test("Then loading page appear", () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    test("Then error page appear", () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
      expect(screen.getAllByText('some error message')).toBeTruthy()
    })
  })
})


/////////////// containers/Bills ////////////////

describe("Given I am connected as an employee", () => {
  //handleClickNewBill
  describe("When user click on button 'Nouvelle note de frais'", () => {
    test("Then page new bill appear", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({data: []})
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const newBills = new Bills({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn(newBills.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(NewBillUI).toBeTruthy()
    })
  })
   //handleClickIconEye
  describe("When user click on icon 'Eye'", () => {
    test("Then modal appear", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const html = BillsUI({data: bills})
      document.body.innerHTML = html
      
      const firestore = null
      const newBills = new Bills({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })

      jQuery.fn.extend({
        modal: function() {
        },
      });

      const handleClickIconEye = jest.fn(e => newBills.handleClickIconEye)
      const eye = screen.queryAllByTestId('icon-eye')
      eye[0].addEventListener('click', handleClickIconEye)
      userEvent.click(eye[0])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})


// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

