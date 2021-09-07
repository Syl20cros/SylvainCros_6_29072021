import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { formatDate } from "../app/format.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      //to-do write expect expression
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

